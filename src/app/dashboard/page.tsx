"use client";
import { useEffect, useState } from "react";
import Outage from "../../../models/Outage";
import { OutageDataWithETA } from "../Types/types";
import { runScraper } from "../Utils/runScraper";

export default function Page() {
  // const [outage, setOutage] = useState<OutageDataWithETA>({
  //   partido: "LLavallol",
  //   localidad: "Monobloc",
  //   afectados: 1443,
  //   eta: "2023-12-12",
  // });

  // useEffect(() => {
  //   fetch("/api/scrape", {
  //     method: "POST",
  //     body: JSON.stringify({
  //       partido: "LLavallol",
  //       localidad: "Monobloc",
  //       afectados: 1443,
  //       eta: "2023-12-12",
  //     }),
  //   })
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error("Network response was not ok");
  //       }
  //       console.log(response);
  //       return response.json(); // Parse JSON data
  //     })
  //     .then((data) => {
  //       console.log("Response:", data); // Log the response data
  //     })
  //     .catch((error) => {
  //       console.error("There was a problem with the fetch operation:", error);
  //     });
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/scrape");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return <p>yoooooo</p>;
}

// async function getScrapingData() {
//   const dataScrape = await runScraper(
//     "https://www.argentina.gob.ar/enre/estado-del-servicio-electrico-de-edesur"
//   );

//   fullData = dataScrape;
//   console.log(fullData);
// }
