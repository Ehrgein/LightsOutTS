import RunScraperButton from "./Components/RunScraperButton";
import React from "react";
import { runScraper } from "./Utils/runScraper";
import Link from "next/link";
import ProviderSelector from "./Components/ProviderSelector";

interface SearchParams {
  runScrapperButton?: boolean;
}

export default function Home({ searchParams }: SearchParams) {
  // if (searchParams.runScraperButton) {
  //   runScraper(
  //     "https://www.argentina.gob.ar/enre/estado-del-servicio-electrico-de-edesur"
  //   )
  //     .then((req) => {
  //       console.log(req);
  //       console.log(
  //         "Scraping and saving data completed successfully, please check where the function is called for more details"
  //       );
  //     })
  //     .catch((err) => {
  //       console.log("Error occured during scraping");
  //       console.log(err);
  //     });
  // }

  return (
    <main className="flex min-h-screen flex-col  items-center justify-between p-24">
      {/* <RunScraperButton /> */}
      <ProviderSelector></ProviderSelector>
    </main>
  );
}

// if needed

// const btn2: any = await frame?.evaluate(() => {
//   const elements = document.querySelectorAll("#CortesBT");
//   return Array.from(elements).map((element) => element.innerHTML);
// });
