import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib";

type LeaderboardUser = {
  author: string;
  username: string;
  over_all_upvote: number | string | null;
  acc_address: string;
};

export async function POST(params: NextRequest) {

  const { acc_address, leaderboard = false, limit = 10 } = await params.json().catch(() => ({}));

  try{
    if (leaderboard) {
      const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));
      const { data, error } = await supabaseServer
        .from("auth")
        .select("author, username, over_all_upvote, acc_address");

      if (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: "Something Went Wrong" }, { status: 408 });
      }

      const rankedUsers = ((data ?? []) as LeaderboardUser[])
        .sort((a, b) => Number(b.over_all_upvote || 0) - Number(a.over_all_upvote || 0))
        .slice(0, pageSize);

      return NextResponse.json({ succes: true, message: rankedUsers }, { status: 200 });
    }

    if (!acc_address) return NextResponse.json({ success: false, error: "Account Address not exist" }, { status: 404 });

    const { data, error } = await supabaseServer
    .from("auth")
    .select("author, username, over_all_upvote, acc_address")
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
