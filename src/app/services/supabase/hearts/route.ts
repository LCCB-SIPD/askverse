import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate_limit";

export async function POST(params: NextRequest) {

  const rate = rateLimit(params, { windowMs: 1000, max: 5, keyPrefix: "health" });
  if (!rate.allowed) {
      const retryAfterSeconds = Math.ceil((rate.resetAt - Date.now()) / 1000);
      return NextResponse.json(
          { success: false, error: "Too many requests. Please try again later." },
          { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      );
  }
  
  const { id, acc_address } = await params.json();

  try {
    if (!id || !acc_address) return NextResponse.json({ success: false, error: "Data Provided not exist" }, { status: 404 });
    
    const { data, error: ErrorHeart } = await supabaseServer
    .from("feeds")
    .select("hearts, hearts_record")
    .eq("id", id)
    .single();

    if (ErrorHeart) {
      return NextResponse.json(
        { success: false, error: "Something Went Wrong" },
        { status: 408 }
      );
    }

    const heartsRecord = data.hearts_record || [];

    if (heartsRecord.includes(acc_address)) {
      return NextResponse.json(
        {
          success: false,
          error: "Already hearted"
        },
        { status: 409 }
      );
    }


    const { error } = await supabaseServer
    .from("feeds")
    .update({
      hearts: data.hearts + 1,
      hearts_record: [...heartsRecord, acc_address]
    })
    .eq("id", id);

    if (error) {
      console.error(error);
      return NextResponse.json({ success: false, error: "Something Went Wrong" }, { status: 408 });
    }

    return NextResponse.json({ success: true, message: "Answered Successfully" }, { status: 200 });

  } catch(err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }

}