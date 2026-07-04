import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";


export async function POST() {

  try{

    const { data, error } = await supabaseServer
    .from("feeds")
    .select("*");

    const { data: answersList, error: Err_answersList } = await supabaseServer
    .from("answersList")
    .select("*");

    if (error || Err_answersList) {
      console.error(error || Err_answersList);
      return NextResponse.json({ success: false, error: "Something Went Wrong" }, { status: 408 });
    }

    return NextResponse.json({ succes: true, message: [data, answersList] }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
  
}