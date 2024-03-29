import { NextResponse, NextRequest } from "next/server";
import connect from "@/app/Utils/db";
import Outage from "../../../../models/Outage";
import { runScraper } from "@/app/Utils/runScraper";

export const GET = async () => {
  try {
    await connect();

    const outages = await Outage.find();

    return new NextResponse(JSON.stringify(outages));
  } catch (error) {
    return new NextResponse("Error in Fetching Posts", { status: 500 });
  }
};

export async function POST(req: NextRequest) {
  const data = await req.json();
  await connect();

  try {
    const outageEntry = await Outage.create(data);
    console.log(outageEntry, "this is the entry");

    /* create a new model in the database */
    return NextResponse.json(
      {
        success: true,
        data: outageEntry,
        message: "Successfully created an entry into the DB",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed in adding a new entry into the DB",
      },
      {
        status: 400,
      }
    );
  }
}
