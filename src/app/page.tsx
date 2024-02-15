import RunScraperButton from "./Components/RunScraperButton";
import { ReadonlyURLSearchParams } from "next/navigation";
import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { resolve } from "path";

interface SearchParams {
  runScrapperButton?: boolean;
}

export default function Home({ searchParams }: SearchParams) {
  if (searchParams.runScraperButton) {
    runScraper();
  }

  return (
    <main className="flex min-h-screen flex-col  items-center justify-between p-24">
      <RunScraperButton />
    </main>
  );
}

const runScraper = async () => {
  //launching browser

  const browser = await puppeteer.launch({
    // headless: false,
  });

  const page = await browser.newPage();

  const endpoint =
    "https://www.argentina.gob.ar/enre/estado-del-servicio-electrico-de-edesur";

  await page.goto(endpoint, {
    waitUntil: "domcontentloaded",
  });
  await page.setViewport({ width: 1080, height: 1024 });

  await page.waitForSelector("#cd-login > #btn-mi-argentina");

  const resultMiArgentina = await page.evaluate(() => {
    const selector = document.querySelector(
      "#cd-login > #btn-mi-argentina"
    )?.innerHTML;

    return selector;
  });

  console.log(resultMiArgentina);

  const handle = await page.waitForSelector("#frame1");

  const frame = await handle?.contentFrame();

  await frame?.waitForSelector("#CortesBT");

  const btn = await frame?.$eval(
    "#CortesBT > tbody tr",
    (node) => (node as HTMLElement).innerHTML
  );
  console.log(btn);

  // page to scrape
};
