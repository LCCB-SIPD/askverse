import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib";


export async function POST(params: NextRequest) {

  const { acc_address, context } = await params.json();

  try{
    console.log("Trying to Log In",acc_address, context);
    if (!acc_address || !context) return NextResponse.json({ success: false, error: "Account Address not exist" }, { status: 404 });

    const randomUsername = `user${Math.floor(
      100000000 + Math.random() * 900000000
    )}`;

    const { data: check_account } = await supabaseServer
    .from("auth")
    .select("acc_address")
    .eq("acc_address", acc_address);

    if (check_account && check_account.length > 0) return NextResponse.json({ success: true, message: "Connected Successfully" }, {status: 200});

    const { error } = await supabaseServer
    .from("auth")
    .insert([{ acc_address: acc_address, context: context, username: randomUsername, author: `Askverse ${randomUsername}` }]);

    if (error) {
      console.error(error);
      return NextResponse.json({ success: false, error: "Something Went Wrong" }, { status: 408 });
    }

    return NextResponse.json({ succes: true, message: "Connected Successfully" }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
  
}