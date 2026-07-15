import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib";

export async function POST(params: NextRequest) {

  const { answer_id, author, body, acc_address } = await params.json();

  try {

    if (!answer_id) return NextResponse.json({ success: false, error: "Answer Id not exist" }, { status: 404 });

    const { error } = await supabaseServer
    .from("reply")
    .insert([{ answer_id, author, body, acc_address }]);

    if (error) {
      console.error(error);
      return NextResponse.json({ success: false, error: "Something Went Wrong" }, { status: 408 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch(err) {
    console.log(err);
    return NextResponse.json({ success: false, error: "Something Went Wrong" }, { status: 500 });
  }

}