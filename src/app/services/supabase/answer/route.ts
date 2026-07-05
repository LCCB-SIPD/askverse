import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib";

export async function POST(params: NextRequest) {
  
  const { author, body, context, acc_address, id } = await params.json();

  try {
    if (!id) return NextResponse.json({ success: false, error: "Data Provided not exist" }, { status: 404 });
    const { error } = await supabaseServer
    .from("answersList")
    .insert({ 
      body: body, 
      gifts: 0, 
      author: author, 
      context: context, 
      acc_address: acc_address,
      questions_id: id
    });

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