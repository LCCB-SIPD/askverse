import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib";

type FeedRow = {
  id: number;
  time?: string;
  answers?: number;
  answersList?: AnswerRow[];
};

type AnswerRow = {
  questions_id: number;
};


export async function POST(request: Request) {

  try{
    const { search = "", acc_address = "", filter = false, page = 1, limit = 5, shared_link = "" } = await request.json().catch(() => ({}));
    const searchTerm = String(search)
    .replaceAll(",", " ")
    .replaceAll("(", " ")
    .replaceAll(")", " ")
    .trim();
    const sharedPostId = Number(shared_link);
    const hasSharedPostId = Number.isFinite(sharedPostId);
    const MAX_PAGE_SIZE = 50;
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(limit) || 3));
    const pageNumber = Math.max(1, Number(page) || 1);

    let feedsQuery = supabaseServer
    .from("feeds")
    .select("*")
    .order("time", { ascending: false });

    if (searchTerm && searchTerm.length >= 5) {
      const pattern = `%${searchTerm.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;

      feedsQuery = feedsQuery.or(
        `question.ilike.${pattern},body.ilike.${pattern},author.ilike.${pattern},acc_address.ilike.${pattern}`
      );
    }

    if (filter && acc_address) {
      feedsQuery = feedsQuery.eq("acc_address", acc_address);
    }

    let sharedFeed: FeedRow | null = null;
    let sharedFeedError: unknown = null;

    if (hasSharedPostId && pageNumber === 1) {
      let sharedFeedQuery = supabaseServer
        .from("feeds")
        .select("*")
        .eq("id", sharedPostId);

      if (searchTerm && searchTerm.length >= 5) {
        const pattern = `%${searchTerm.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;

        sharedFeedQuery = sharedFeedQuery.or(
          `question.ilike.${pattern},body.ilike.${pattern},author.ilike.${pattern},acc_address.ilike.${pattern}`
        );
      }

      if (filter && acc_address) {
        sharedFeedQuery = sharedFeedQuery.eq("acc_address", acc_address);
      }

      const sharedRes = await sharedFeedQuery.maybeSingle();
      sharedFeed = sharedRes.data as FeedRow | null;
      sharedFeedError = sharedRes.error;
    }

    if (hasSharedPostId) {
      feedsQuery = feedsQuery.neq("id", sharedPostId);
    }

    const hasSharedFeed = Boolean(sharedFeed);
    const start = hasSharedPostId && hasSharedFeed
      ? Math.max(0, (pageNumber - 1) * pageSize - 1)
      : (pageNumber - 1) * pageSize;
    const normalPageSize = hasSharedPostId && hasSharedFeed && pageNumber === 1
      ? Math.max(0, pageSize - 1)
      : pageSize;
    const end = start + normalPageSize - 1;

    const { data, error } = normalPageSize > 0
      ? await feedsQuery.range(start, end)
      : { data: [], error: null };

    const normalFeeds = Array.isArray(data) ? (data as FeedRow[]) : [];
    const feeds = sharedFeed ? [sharedFeed, ...normalFeeds] : normalFeeds;

    // Fetch answers only for the feeds returned on this page (avoid selecting whole table)
    let answersList: AnswerRow[] = [];
    let Err_answersList: unknown = null;

    if (feeds.length > 0) {
      const feedIds = feeds.map((feed) => feed.id).filter((id): id is number => Boolean(id));
      if (feedIds.length > 0) {
        const res = await supabaseServer
          .from("answersList")
          .select("*")
          .in("questions_id", feedIds);
        answersList = res.data || [];
        Err_answersList = res.error;
      }
    }

    const feedsWithAnswers = feeds.map((feed) => {
      const feedAnswers = answersList.filter((answer) => answer.questions_id === feed.id);

      return {
        ...feed,
        answers: feedAnswers.length,
        answersList: feedAnswers,
      };
    });

    if (error || sharedFeedError || Err_answersList) {
      console.error(error || sharedFeedError || Err_answersList);
      return NextResponse.json({ success: false, error: "Something Went Wrong" }, { status: 408 });
    }

    return NextResponse.json({ success: true, message: [feedsWithAnswers, answersList] }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err }, { status: 500 });
  }
  
}
