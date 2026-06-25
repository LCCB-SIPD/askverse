import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";


export async function POST() {

  try{

    const { data, error } = await supabaseServer
    .from("feeds")
    .select("*");

    if (error) {
      console.error(error);
      return NextResponse.json({ success: false, error: "Something Went Wrong" }, { status: 408 });
    }

    return NextResponse.json({ succes: true, message: data }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
  
}