"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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

const GIFT_AMOUNTS = [100, 250, 500, 1000] as const;

export default function Content_feed({ acc_address, displayName, context, filter, filterSearch } : Content_feedProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [giftTarget, setGiftTarget] = useState<{ questionId: string; acc_address: string, author: string, context: string } | null>(null);
  const [giftAmount, setGiftAmount] = useState<(typeof GIFT_AMOUNTS)[number]>(100);
  const [giftNote, setGiftNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { refreshBalances } = useWalletStatus(); 

  useEffect(() => {
    setFeedItems([]);
    setPage(1);
    setHasMore(true);
  }, [filter, filterSearch, acc_address]);

  useEffect(() => {
    let cancelled = false;

    async function Retrieve() {
      
      setFeedLoading(true);

      const response = await Fetch_to(json_route.feeds.retrieve_post, {
        search: filterSearch,
        page,
        limit: 3,
      });

      if (response.success) {
        const result = response.data.message;
        const posts: FeedItem[] = result[0];
        const answers: FeedItem["answersList"] = result[1];

        const merged = posts.map((post: FeedItem) => {
          const answersList = answers.filter(
            (answer) => answer.questions_id === post.id
          );

          return {
            ...post,
            answers: answersList.length,
            answersList,
          };
        });

        const myPosts = merged.filter(
          (item) => item.acc_address === acc_address
        );

        if (!cancelled) {
          const nextItems = filter ? myPosts : merged;
          setFeedItems((current) => (page === 1 ? nextItems : [...current, ...nextItems]));
          setHasMore(posts.length === 3);
        }
        
      }

      if (!cancelled) {
        setFeedLoading(false);
      }
    }
    Retrieve();
    return () => {
      cancelled = true;
    };
  }, [refresh, filter, filterSearch, acc_address, page]);

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


  const handleOpenAnswers = (id: number) => {
    setActiveQuestionId(id);
  };

  const handleCloseAnswers = () => {
    setActiveQuestionId(null);
    setReplyDraft("");
    setGiftTarget(null);
    setGiftAmount(100);
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
    setGiftAmount(100);
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
        setRefresh(true);
        refreshBalances();
        setLoading(false);
      }
    } else {
      alert("Something went wrong");
      setLoading(false);
    }

    setGiftTarget(null);
    setGiftAmount(100);
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
        {[...feedItems]
          .sort(
            (a, b) =>
              new Date(b.time).getTime() - new Date(a.time).getTime()
          ).map((item) => (
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
            </article>
        ))}
        <div ref={loadMoreRef} className={styles.feed_loader}>
          {feedLoading && <span>Loading more...</span>}
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
