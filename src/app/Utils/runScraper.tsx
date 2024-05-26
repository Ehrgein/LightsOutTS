import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import {
  ProviderIncidenceRecord,
  OutageDataWithETA,
  BasicOutageData,
  ReportType,
} from "../Types/types";
import connect from "@/app/Utils/db";
import Outage from "../../../models/Outage";

export const runScraper = async (endpoint: string) => {
  //launching browser




  const browser = await puppeteer.launch({
    //  headless: false,
  });

  const scrapePage = async(endpoint: string) {

  }

  const page = await browser.newPage();

  await page.goto(endpoint, {
    waitUntil: "domcontentloaded",
  });
  await page.setViewport({ width: 1080, height: 1024 });

  const handle = await page.waitForSelector("#frame1");

  const frame = await handle?.contentFrame();

  await frame?.waitForSelector("#CortesBT");
  await frame?.waitForSelector("#CortesProgramados");

  const cortes_programados_data: OutageDataWithETA[] = [];
  const cortes_mt_data: OutageDataWithETA[] = [];
  const cortes_bt_data: BasicOutageData[] = [];

  async function getData(selector: string) {
    const cortesBajaTension: any = await frame?.evaluate((selector) => {
      const elements = document.querySelector(selector);
      return elements?.outerHTML; //Promise.resolve(elements?.outerHTML);
    }, selector);

    return cortesBajaTension;
  }

  // this returns a cheerio object
  const newCortesProgramados = await getData("#CortesProgramados");
  const newCortesMediaTension = await getData("#InterrupcionesServicio");
  const newCortesBajaTension = await getData("#CortesBT");

  const outageProviderData: ProviderIncidenceRecord = {
    edesur: {
      programados: cortes_programados_data,
      mt: cortes_mt_data,
      bt: cortes_bt_data,
    },
    edenor: {
      programados: cortes_programados_data,
      mt: cortes_mt_data,
      bt: cortes_bt_data,
    },
  };

  function parseCheerio(cheerioObj: string, reportType: ReportType) {
    const $ = cheerio.load(cheerioObj);

    // Grabbing all table row elements that are a direct children of tbody
    const tableRows = $("tbody > tr");

    // We iterate over each selected row, providing an index and the row element as parameters for the callback (we dont need the index, but each expects it)
    tableRows.each((index, row) => {
      // $(row) converts each row element into a Cheerio object to use later
      // find('td') selects all the elements within the current row (partido, localidad, afectados)
      const cells = $(row).find("td"); //

      const partido = cells.eq(0).text().trim(); // First <td> element - "Partido"
      const localidad = cells.eq(1).text().trim(); // Second <td> element - "Localidad/Barrio"
      const afectadosIndex = reportType === "cortes-bt" ? 2 : 3; // Gteting the 2nd td if cortes-bt is the type, or 3rd one if it isn't. This is just a messup on ENRE.
      const afectados = parseInt(cells.eq(afectadosIndex).text().trim(), 10); // Third (or second) <td> - "Usuarios Afectados"
      const eta = cells.eq(4).text().trim(); // Fifth <td> element - "Hora Estimada de Normalizacion/ETA"

      // Getting the data of each cell and pushing it to an object

      // length 3: baja tension
      if (reportType === "cortes-bt") {
        outageProviderData.edesur.bt.push({
          partido,
          localidad,
          afectados,
        });
        // length 5: cortes programados
      } else if (reportType === "cortes-programados") {
        outageProviderData.edesur.programados.push({
          partido,
          localidad,
          afectados,
          eta,
        });
      } else if (reportType === "cortes-mt") {
        outageProviderData.edesur.mt.push({
          partido,
          localidad,
          afectados,
          eta,
        });
      }
    });
  }

  parseCheerio(newCortesProgramados, "cortes-programados");
  parseCheerio(newCortesMediaTension, "cortes-mt");
  parseCheerio(newCortesBajaTension, "cortes-bt");

  const scrapeData = async(endpoint: string, provider: string) => {

    const {programados, mediaTensionData, bajaTensionData } = await scrapePage(endpoint)

    const outageProviderData: ProviderIncidenceRecord = {
      [provider]: {
        programados: [],
        mt: [],
        bt: [],
      },
    };

    parseCheerio(newCortesProgramados, "cortes-programados");
    parseCheerio(newCortesMediaTension, "cortes-mt");
    parseCheerio(newCortesBajaTension, "cortes-bt");

  }

  const edesurData = {
    edesur: {
      programados: outageProviderData.edesur.programados,
      mt: outageProviderData.edesur.mt,
      bt: outageProviderData.edesur.mt,
    },
  };

  const edenorData = {
    edenor: {
      programados: outageProviderData.edenor.programados,
      mt: outageProviderData.edenor.mt,
      bt: outageProviderData.edenor.bt,
    },
  };

  const combinedData = {
    ...edenorData,
    ...edesurData,
  };
  // DO NOT REMOVE THIS LINE
  await connect();

  console.log(combinedData, "complete data edesur");

  await Outage.create(combinedData);

  browser.close();
};
