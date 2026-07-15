import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib";

export async function POST(params: NextRequest) {

  const { answer_ids } = await params.json();

  try {

    if (!answer_ids || !Array.isArray(answer_ids) || answer_ids.length === 0) {
      return NextResponse.json({ success: false, error: "Answer Ids not exist" }, { status: 404 });
    }

    const { data, error } = await supabaseServer
      .from("reply")
      .select("*")
      .in("answer_id", answer_ids)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json({ success: false, error: "Something Went Wrong" }, { status: 408 });
    }

    // group replies by answer_id so the client can merge them straight into answersList
    const grouped: Record<string, typeof data> = {};
    data.forEach((reply) => {
      const key = String(reply.answer_id);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(reply);
    });

    return NextResponse.json({ success: true, message: grouped }, { status: 200 });

  } catch (err) {
    console.log(err);
    return NextResponse.json({ success: false, error: "Something Went Wrong" }, { status: 500 });
  }

}