import { NextResponse, NextRequest } from "next/server";
import connect from "@/app/Utils/db";
import Outage from "../../../../models/Outage";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    const provider = searchParams.get("provider") || "edesur";

    await connect();

    const outages = await Outage.findOne().sort({ createdAt: -1 });

    if (!outages) {
      return new NextResponse("No outages found", { status: 404 });
    }

    const data = outages[provider as keyof typeof outages];

    return new NextResponse(JSON.stringify(data));
  } catch (error) {
    return new NextResponse("Error in Fetching Posts", { status: 500 });
  }
};

export async function POST(req: NextRequest) {
  const data = await req.json();

  await connect();

  try {
    const outageEntry = await Outage.create(data);

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
