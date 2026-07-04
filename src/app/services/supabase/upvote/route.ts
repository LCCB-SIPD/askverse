import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(params: NextRequest) {
  
  const { id, acc_address, upvote_add } = await params.json();

  if (!acc_address || !id) return NextResponse.json({ success: true, error: "Identity Not Exist" }, { status: 402 });
  
  console.log("Gift: ", id);

  const { data: UserData, error: UserError } = await supabaseServer
  .from("auth")
  .select("over_all_upvote")
  .eq("acc_address", acc_address);

  if (UserError) {
    console.error(UserError);
    return NextResponse.json({ success: false, error: "Something Went Wrong" }, { status: 405 });
  }

  const over_all_upvote = UserData[0].over_all_upvote + upvote_add;

  const { error: Err_User_update } = await supabaseServer
  .from("auth")
  .update([{ over_all_upvote: over_all_upvote }])
  .eq("acc_address", acc_address);

  if (Err_User_update) {
    console.error(Err_User_update);
    return NextResponse.json({ success: false, error: "Something Went Wrong" }, { status: 405 });
  }

  //Answers
  const { data: AnswersData, error: AnswersError } = await supabaseServer
  .from("answersList")
  .select("gifts")
  .eq("id", id);

  if (AnswersError) {
    console.error(AnswersError);
    return NextResponse.json({ success: false, error: "Something Went Wrong" }, { status: 405 });
  }

  const gifts_added = AnswersData[0].gifts + upvote_add;

  const { error: AnswersError2 } = await supabaseServer
  .from("answersList")
  .update([{ gifts: gifts_added }])
  .eq("id", id);

  if (AnswersError2) {
    console.error(AnswersError2);
    return NextResponse.json({ success: false, error: "Something Went Wrong" }, { status: 405 });
  }

  return NextResponse.json({ success: true, message: "Successfully Upvote" }, { status: 200 });
}