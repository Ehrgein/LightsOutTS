import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import {
  ProviderIncidenceRecord,
  OutageDataWithETA,
  BasicOutageData,
  ReportType,
} from "../Types/types";
import Outage from "../../../models/Outage";
import connect from "@/app/Utils/db";

async function getData(frame: any, selector: string) {
  const cortesBajaTension: any = await frame?.evaluate((selector: any) => {
    const elements = document.querySelector(selector);
    return elements?.outerHTML; //Promise.resolve(elements?.outerHTML);
  }, selector);

  return cortesBajaTension;
}

function parseCheerio(
  cheerioObj: string,
  reportType: ReportType,
  provider: "edesur" | "edenor",
  outageProviderData: ProviderIncidenceRecord
) {
  const $ = cheerio.load(cheerioObj);

  // Grabbing all table row elements that are a direct children of tbody
  const tableRows = $("tbody > tr");

  // We iterate over each selected row, providing an index and the row element as parameters for the callback (we dont need the index, but each expects it)
  tableRows.each((index, row) => {
    // $(row) converts each row element into a Cheerio object to use later
    // find('td') selects all the elements within the current row (partido, localidad, afectados)
    const cells = $(row).find("td"); //

    console.log(cells.eq(0).text().trim());

    const partido = cells.eq(0).text().trim(); // First <td> element - "Partido"
    const localidad = cells.eq(1).text().trim(); // Second <td> element - "Localidad/Barrio"
    const afectadosIndex = reportType === "cortes-bt" ? 2 : 3; // Gteting the 2nd td if cortes-bt is the type, or 3rd one if it isn't. This is just a messup on ENRE.
    const afectados = parseInt(cells.eq(afectadosIndex).text().trim(), 10); // Third (or second) <td> - "Usuarios Afectados"
    const eta = cells.eq(4).text().trim(); // Fifth <td> element - "Hora Estimada de Normalizacion/ETA"

    // Getting the data of each cell and pushing it to an object

    // length 3: baja tension
    if (reportType === "cortes-bt") {
      outageProviderData[provider].bt.push({ partido, localidad, afectados });
      // length 5: cortes programados
    } else if (reportType === "cortes-mt") {
      outageProviderData[provider].mt.push({
        partido,
        localidad,
        afectados,
        eta,
      });
    }
  });
}

export const runScraper = async (endpoint: string) => {
  console.log("hello, we are scraping");
  //launching browse

  const browser = await puppeteer.launch({
    //  headless: false,
  });
  const page = await browser.newPage();

  const outageProviderData: ProviderIncidenceRecord = {
    edesur: { mt: [], bt: [] },
    edenor: { mt: [], bt: [] },
  };

  await page.goto(endpoint, {
    waitUntil: "domcontentloaded",
  });
  await page.setViewport({ width: 1080, height: 1024 });
  const handle = await page.waitForSelector("#frame1");
  const frame = await handle?.contentFrame();
  await frame?.waitForSelector("#CortesBT");

  // this returns a cheerio object
  const newCortesMediaTension = await getData(frame, "#InterrupcionesServicio");
  const newCortesBajaTension = await getData(frame, "#CortesBT");

  if (newCortesMediaTension) {
    parseCheerio(
      newCortesMediaTension,
      "cortes-mt",
      "edesur",
      outageProviderData
    );
  }
  if (newCortesBajaTension) {
    parseCheerio(
      newCortesBajaTension,
      "cortes-bt",
      "edesur",
      outageProviderData
    );
  }

  const combinedData = { ...outageProviderData };

  // DO NOT REMOVE THIS LINE
  await connect();

  console.log(combinedData.edesur.bt, "complete data edesur");
  console.log(combinedData.edenor.bt, "complete data edenor");

  await Outage.create(combinedData);

  browser.close();
};
