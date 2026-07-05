import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib";


export async function POST(request: Request) {

  try{
    const { search = "", acc_address = "", filter = false, page = 1, limit = 3 } = await request.json().catch(() => ({}));
    const searchTerm = String(search)
    .replaceAll(",", " ")
    .replaceAll("(", " ")
    .replaceAll(")", " ")
    .trim();
    const pageSize = Math.max(1, Number(limit) || 3);
    const pageNumber = Math.max(1, Number(page) || 1);
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize - 1;

    let feedsQuery = supabaseServer
    .from("feeds")
    .select("*")
    .order("time", { ascending: false })
    .range(start, end);

    if (searchTerm) {
      const pattern = `%${searchTerm.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;

      feedsQuery = feedsQuery.or(
        `question.ilike.${pattern},body.ilike.${pattern},author.ilike.${pattern},acc_address.ilike.${pattern}`
      );
    }

    if (filter && acc_address) {
      feedsQuery = feedsQuery.eq("acc_address", acc_address);
    }

    const { data, error } = await feedsQuery;

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
