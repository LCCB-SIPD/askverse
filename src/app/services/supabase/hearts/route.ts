import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, rateLimit } from "@/lib";

export async function POST(req: NextRequest) {
  const rate = rateLimit(req, {
    windowMs: 1000,
    max: 5,
    keyPrefix: "health",
  });

  if (!rate.allowed) {
    const retryAfterSeconds = Math.ceil(
      (rate.resetAt - Date.now()) / 1000
    );

    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
        },
      }
    );
  }

  const { id, acc_address } = await req.json();

  try {
    if (!id || !acc_address) {
      return NextResponse.json(
        {
          success: false,
          error: "Data Provided not exist",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("feeds")
      .select("hearts, hearts_record")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Something Went Wrong",
        },
        { status: 500 }
      );
    }

    const heartsRecord: string[] = data.hearts_record ?? [];

    const alreadyHearted = heartsRecord.includes(acc_address);

    const updatedHeartsRecord = alreadyHearted
      ? heartsRecord.filter((wallet) => wallet !== acc_address)
      : [...heartsRecord, acc_address];

    const updatedHearts = alreadyHearted
      ? Math.max(0, data.hearts - 1)
      : data.hearts + 1;

    const { error: updateError } = await supabaseServer
      .from("feeds")
      .update({
        hearts: updatedHearts,
        hearts_record: updatedHeartsRecord,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          error: "Something Went Wrong",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        hearted: !alreadyHearted,
        hearts: updatedHearts,
        hearts_record: updatedHeartsRecord,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}