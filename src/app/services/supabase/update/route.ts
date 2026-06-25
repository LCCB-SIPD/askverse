import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(params: NextRequest) {
  
  const { author, username, acc_address } = await params.json();

  try {
    if (!acc_address) return NextResponse.json({ success: false, error: "Account Address not exist" }, { status: 404 });

    const { error } = await supabaseServer
    .from("auth")
    .update({ author: author, username: username })
    .eq("acc_address", acc_address);

    if (error) {
      console.error(error);
      return NextResponse.json({ success: false, error: "Author and Username Already Exist" }, { status: 408 });
    }

    return NextResponse.json({ success: true, message: "Updated Successfully" }, { status: 200 });

  } catch(err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }

}