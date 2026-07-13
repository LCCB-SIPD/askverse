"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import styles from "./css/styles.module.css";
import { Fetch_to, formatTimeAgo } from "@/utilities";
import json_route from "@/config/json_route/route.json";
import { CordyStackTransStellar, useWalletStatus } from "@cordystackx/cordy_minikit";

type FeedItem = {
  id: number;
  author: string;
  time: string;
  question: string;
  body: string;
  hearts: number;
  answers: number;
  acc_address: string;
  answersList: Array<{
    author: string;
    body: string;
    time: string;
    gifts: number;
    acc_address: string;
    id: string;
    context: string;
    questions_id: number;
  }>;
  hearts_record: Array<string>;
};

type Content_feedProps = {
  acc_address: string;
  displayName: string;
  context: string;
  filter: boolean;
  filterSearch: string;
  globalRefresh: boolean;
  shared_link?: string;
}

function HeartIcon({ active }: { active?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={active ? styles.heart_active : styles.heart}
    >
      <path d="M12 21s-7.2-4.7-9.7-9C.5 8.8 2.2 5.5 5.7 4.7c1.9-.5 4 .2 5.5 1.8 1.5-1.6 3.6-2.3 5.5-1.8 3.5.8 5.2 4.1 3.4 7.3C19.2 16.3 12 21 12 21z" />
    </svg>
  );
}

function FeedSkeleton() {
  return (
    <article className={styles.post}>
      <div className={styles.skeleton_head}>
        <div className={styles.skeleton_avatar} />
        <div className={styles.skeleton_stack}>
          <div className={styles.skeleton_line} />
          <div className={styles.skeleton_line_short} />
        </div>
      </div>
      <div className={styles.skeleton_body}>
        <div className={styles.skeleton_line} />
        <div className={styles.skeleton_line} />
        <div className={styles.skeleton_line_medium} />
      </div>
      <div className={styles.skeleton_actions}>
        <div className={styles.skeleton_pill} />
        <div className={styles.skeleton_pill_small} />
      </div>
    </article>
  );
}

const GIFT_AMOUNTS = [5, 10, 20, 50, 75, 100, 500, 750, 1000] as const;

export default function Content_feed({ shared_link, acc_address, displayName, context, filter, filterSearch, globalRefresh } : Content_feedProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [giftTarget, setGiftTarget] = useState<{ questionId: string; acc_address: string, author: string, context: string } | null>(null);
  const [giftAmount, setGiftAmount] = useState<(typeof GIFT_AMOUNTS)[number]>(20);
  const [giftNote, setGiftNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [copiedShareId, setCopiedShareId] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { refreshBalances } = useWalletStatus(); 

  useEffect(() => {
    setFeedItems([]);
    setPage(1);
    setHasMore(true);
  }, [filter, filterSearch, acc_address, shared_link]);

  useEffect(() => {

    async function Retrieve() {
      
      setFeedLoading(true);

      const response = await Fetch_to(json_route.feeds.retrieve_post, {
        search: filterSearch,
        acc_address,
        filter,
        shared_link,
        page,
        limit: 5,
      });

      if (response.success) {
        const result = response.data.message;
        const posts: FeedItem[] = result[0];

        
        setFeedItems((current) => (page === 1 ? posts : [...current, ...posts]));
        setHasMore(posts.length === 5);

        
      }

      setFeedLoading(false);
    }
    Retrieve();
  }, [shared_link, refresh, filter, filterSearch, acc_address, page, globalRefresh]);

  useEffect(() => {
    const observerTarget = loadMoreRef.current;
    if (!observerTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasMore && !feedLoading) {
          setPage((current) => current + 1);
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.1 },
    );

    observer.observe(observerTarget);
    return () => observer.disconnect();
  }, [hasMore, feedLoading]);
  
  const activeQuestion = useMemo(
    () => feedItems.find((item) => item.id === activeQuestionId) ?? null,
    [activeQuestionId, feedItems],
  );

  const getShareUrl = useCallback((postId: number) => {
    const baseUrl =
      typeof window === "undefined"
        ? "/home"
        : `${window.location.origin}${window.location.pathname}`;
    const shareUrl = new URL(baseUrl, typeof window === "undefined" ? "http://localhost" : window.location.origin);
    shareUrl.searchParams.set("shared_linkpostid", String(postId));

    return typeof window === "undefined" ? shareUrl.pathname + shareUrl.search : shareUrl.toString();
  }, []);

  const handleSharePost = async (item: FeedItem) => {
    const url = getShareUrl(item.id);

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.question,
          text: item.body,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopiedShareId(item.id);
        window.setTimeout(() => setCopiedShareId(null), 1800);
      }
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") {
        alert("Unable to share this post right now.");
      }
    }
  };


  const handleOpenAnswers = (id: number) => {
    setActiveQuestionId(id);
  };

  const handleCloseAnswers = () => {
    setActiveQuestionId(null);
    setReplyDraft("");
    setGiftTarget(null);
    setGiftAmount(20);
    setGiftNote("");
  };

  const handleSubmitAnswer = async() => {
    if (!activeQuestion || !replyDraft.trim()) return;

    const randomUsername = `${Math.floor(
      100000000 + Math.random() * 900000000
    )}`;

    const newAnswer = {
      author: displayName,
      body: replyDraft.trim(),
      time: new Date().toISOString(),
      gifts: 0,
      acc_address: acc_address,
      id: randomUsername,
      context: context,
      questions_id: 0
    };

    setFeedItems((current) =>
      current.map((item) =>
        item.id === activeQuestion.id
          ? {
              ...item,
              answers: item?.answers + 1,
              answersList: [newAnswer, ...item.answersList],
            }
          : item,
      ),
    );

    setReplyDraft("");

    await Fetch_to(json_route.feeds.answer, { id: activeQuestion?.id, author: displayName, body: replyDraft, context: context, acc_address: acc_address });

  };

  const handleOpenGift = (questionId: string, acc_address: string, author: string, context: string) => {
    setGiftTarget({ questionId, acc_address, author, context });
    setGiftAmount(20);
    setGiftNote("");
  };

  const handleSubmitGift = async() => {
    if (!giftTarget) return alert("Gift Target Not Exist");
    setRefresh(true);

    if (context !== "Non-EVM") return alert("Invalid Wallet Please use Non-EVMs Wallets");

    if (giftTarget.context === "EVM") return alert("Invalid User Wallet, User not supported Non-EVMs Wallets");

    setLoading(true);
    const response = await CordyStackTransStellar(giftTarget.acc_address, giftAmount, { memo: giftNote });

    if (response) {
      

      const response = await Fetch_to(json_route.feeds.upvote, {
        id: giftTarget.questionId,
        acc_address: giftTarget.acc_address,
        upvote_add: giftAmount,
        answersList: activeQuestion?.answersList
      });

      if (response.success) {
        alert("Send Gift Successfully to " + giftTarget.author);
        setRefresh(false);
        refreshBalances();
        setLoading(false);
      }
    } else {
      alert("Something went wrong");
      setLoading(false);
    }

    setGiftTarget(null);
    setGiftAmount(20);
    setGiftNote("");
  };

  return(
    <section className={styles.container}>
      <div className={styles.compose}>
        <div className={styles.avatar}>U</div>
        <div className={styles.compose_box}>
          <p>What question do you want answered?</p>
          <div className={styles.compose_actions}>
            <span>Ask</span>
            <span>Earn</span>
            <span>Verify</span>
          </div>
        </div>
      </div>

      <div className={styles.feed}>
        {feedLoading && feedItems.length === 0 ? (
          Array.from({ length: 5 }).map((_, index) => (
            <FeedSkeleton key={index} />
          ))
        ) : (
          feedItems.map((item) => (
            <article className={styles.post} key={item.id}>
              
              <div className={styles.post_head}>
                <div>
                  <strong>{item.acc_address === acc_address ? "Your Question" : item.author}</strong>
                  <p style={{ marginTop: "1rem", fontWeight: "bolder" }}> {item.question}</p>
                </div>
                <span>{formatTimeAgo(item.time)}</span>
              </div>

              <p className={styles.post_body}>{item.body}</p>
              <div className={styles.question_chip}>Question</div>

              <div className={styles.post_footer}>
                <button type="button" onClick={() => handleOpenAnswers(item.id)}>
                  Show Answers
                </button>
                <button type="button" onClick={() => handleSharePost(item)}>
                  {copiedShareId === item.id ? "Link Copied" : "Share"}
                </button>
                <button onClick={async() => {
                  setFeedItems((prev) =>
                    prev.map((post) => {
                      if (post.id !== item.id) return post; // <-- Only update this post

                      const alreadyHearted = post.hearts_record.includes(acc_address);

                      return {
                        ...post,
                        hearts: alreadyHearted ? post.hearts - 1 : post.hearts + 1,
                        hearts_record: alreadyHearted
                          ? post.hearts_record.filter(
                              (wallet) => wallet !== acc_address
                            )
                          : [...post.hearts_record, acc_address],
                      };
                    })
                  );
                  await Fetch_to(json_route.feeds.hearts, { id: item.id, acc_address: acc_address });
                }} type="button" className={styles.heart_button}>
                  <HeartIcon active />
                  <span >{item.hearts}</span>
                </button>
              </div>
              {item.acc_address === acc_address ? (
                <button type="button" onClick={async() => {
                  const confirmed = window.confirm("Are you sure you want to delete this post?");
                  if (!confirmed) return;

                  await Fetch_to(json_route.feeds.delete_post, { id: item.id });
                  setRefresh(true);
                  setTimeout(() => setRefresh(false), 100);
                }} className={styles.delete_button}>Delete This Post</button>
              ) : null}
            </article>
          ))
        )}
        <div ref={loadMoreRef} className={styles.feed_loader}>
          {feedLoading && feedItems.length > 0 && <FeedSkeleton />}
        </div>
      </div>

      {activeQuestion && (
        <div className={styles.answer_overlay} role="presentation" onClick={handleCloseAnswers}>
          <div
            className={styles.answer_sheet}
            role="dialog"
            aria-modal="true"
            aria-label="Question answers"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.answer_sheet_head}>
              <div>
                <p>Answers</p>
                <h3>{activeQuestion.question}</h3>
              </div>
              <button type="button" onClick={handleCloseAnswers}>Close</button>
            </div>

            <div className={styles.answer_list}>
              <div className={styles.answer_editor}>
                <label htmlFor="reply-drawer">Your answer</label>
                <textarea
                  id="reply-drawer"
                  value={replyDraft}
                  onChange={(event) => setReplyDraft(event.target.value)}
                  placeholder="Write a helpful answer..."
                />
                <div className={styles.answer_editor_actions}>
                  <button type="button" onClick={handleSubmitAnswer}>Submit</button>
                </div>
              </div>

              
                {activeQuestion && activeQuestion.answersList?.length > 0 ? (
                [...activeQuestion.answersList]
                  .sort((a, b) => b.gifts - a.gifts).map((answer) => (
                      <article key={`${answer.id}-${answer.author}`} className={styles.answer_item}>
                        <div className={styles.answer_item_head}>
                          <strong>{answer.acc_address === acc_address ? "You" : answer.author + " " + answer.context + " Wallets"}</strong>
                          <span>{formatTimeAgo(answer.time)}</span>
                        </div>
                        <p style={{ whiteSpace: "pre-line" }} >{answer.body}</p>
                        {answer.acc_address !== acc_address && (
                          <div className={styles.answer_item_footer}>
                            <p style={{ margin: "5px 20px" }} >Upvote Score: {answer.gifts} points</p>
                            <button
                              type="button"
                              className={styles.gift_button}
                              onClick={() => handleOpenGift(answer.id , answer.acc_address, answer.author, answer.context)}
                            >
                              Gift XLM
                            </button>
                          </div>
                        )}
                      </article>
                    ))
                  ) : (
                    <h2 style={{ textAlign: "center" }}>No Answer Yet</h2>
                  )}
                </div>
            {giftTarget && (
              <div className={styles.gift_panel}>
                <div className={styles.gift_panel_head}>
                  <div>
                    <p>Gift creator</p>
                    <h4>{giftTarget.author}</h4>
                  </div>
                </div>

                <div className={styles.gift_amounts}>
                  {GIFT_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className={amount === giftAmount ? styles.gift_amount_active : styles.gift_amount}
                      onClick={() => setGiftAmount(amount)}
                    >
                      {amount} XLM
                    </button>
                  ))}
                </div>

                <label className={styles.gift_note_label} htmlFor="gift-note">
                  Optional note
                </label>
                <textarea
                  id="gift-note"
                  value={giftNote}
                  onChange={(event) => setGiftNote(event.target.value)}
                  placeholder="Say thanks to this answer..."
                />

                <div className={styles.gift_panel_actions}>
                  <button type="button" onClick={() => setGiftTarget(null)}>Cancel</button>
                  <button type="button" onClick={handleSubmitGift}>
                    {loading ? "Sending..." : (`Send ${giftAmount} XLM`) }
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
