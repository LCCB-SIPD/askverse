import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(params: NextRequest) {
  
  const { answersList, id } = await params.json();

  try {
    if (!id || answersList.length <= 0) return NextResponse.json({ success: false, error: "Data Provided not exist" }, { status: 404 });
    const { error } = await supabaseServer
    .from("feeds")
    .update({ answersList })
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