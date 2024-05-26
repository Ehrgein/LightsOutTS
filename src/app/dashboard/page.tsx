"use client";

import OutagesModeled from "../Components/OutagesModeled";

export default function Page() {
  return (
    <div>
      <OutagesModeled />
    </div>
  );
}

// async function getScrapingData() {
//   const dataScrape = await runScraper(
//     "https://www.argentina.gob.ar/enre/estado-del-servicio-electrico-de-edesur"
//   );

//   console.log(dataScrape);
// }
