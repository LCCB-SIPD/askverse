import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib";


export async function POST(params: NextRequest) {

  const { acc_address } = await params.json();

  try{
    if (!acc_address) return NextResponse.json({ success: false, error: "Account Address not exist" }, { status: 404 });

    const { data, error } = await supabaseServer
    .from("auth")
    .select("author, username, over_all_upvote")
    .eq("acc_address", acc_address);

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