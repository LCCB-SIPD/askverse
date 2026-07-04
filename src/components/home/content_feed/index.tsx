"use client";

import { useMemo, useState, useEffect } from "react";
import styles from "./css/styles.module.css";
import { Fetch_to, formatTimeAgo } from "@/utilities";
import json_route from "@/config/json_route/route.json";
import { CordyStackTransStellar } from "@cordystackx/cordy_minikit";

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
  }>;
};

type Content_feedProps = {
  acc_address: string;
  displayName: string;
  context: string;
  filter: boolean;
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

export default function Content_feed({ acc_address, displayName, context, filter } : Content_feedProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [giftTarget, setGiftTarget] = useState<{ questionId: number; acc_address: string, author: string, context: string } | null>(null);
  const [giftAmount, setGiftAmount] = useState<(typeof GIFT_AMOUNTS)[number]>(100);
  const [giftNote, setGiftNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    async function Retrieve() {
      const response = await Fetch_to(json_route.feeds.retrieve_post);

      if (response.success) {
        const myPosts = feedItems.filter(
          (item) => item.acc_address === acc_address
        );
        setFeedItems(filter ? myPosts : response.data.message);
      }
    }
    Retrieve();
  }, [refresh, filter]);
  
  const activeQuestion = useMemo(
    () => feedItems.find((item) => item.id === activeQuestionId) ?? null,
    [activeQuestionId, feedItems],
  );

  useEffect(() => {
    async function Answer() {
      await Fetch_to(json_route.feeds.answer, { id: activeQuestion?.id, answersList: activeQuestion?.answersList });
      setLoading(false);
    }
    Answer();
  }, [activeQuestion?.answersList]);


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
    setLoading(true);
    const randomUsername = `user${Math.floor(
      100000000 + Math.random() * 900000000
    )}`;

    const newAnswer = {
      author: displayName,
      body: replyDraft.trim(),
      time: new Date().toISOString(),
      gifts: 0,
      acc_address: acc_address,
      id: randomUsername,
      context: context
    };

    setFeedItems((current) =>
      current.map((item) =>
        item.id === activeQuestion.id
          ? {
              ...item,
              answers: item.answers + 1,
              answersList: [newAnswer, ...item.answersList],
            }
          : item,
      ),
    );

    
    setReplyDraft("");

  };

  const handleOpenGift = (questionId: number, acc_address: string, author: string, context: string) => {
    setGiftTarget({ questionId, acc_address, author, context });
    setGiftAmount(100);
    setGiftNote("");
  };

  const handleSubmitGift = async() => {
    if (!giftTarget) return;
    
    if (context !== "Non-EVM") return alert("Invalid Wallet Please use Non-EVMs Wallets");

    if (giftTarget.context === "EVM") return alert("Invalid User Wallet, User not supported Non-EVMs Wallets");

    setLoading(true);
    const response = await CordyStackTransStellar(giftTarget.acc_address, giftAmount, { memo: giftNote });

    if (response) {
      alert("Send Gift Successfully to " + giftTarget.author);
      setLoading(false);
    } else {
      alert("Something went wrong");
      setLoading(false);
    }

    setFeedItems((current) =>
      current.map((item) => {
        if (item.id !== giftTarget.questionId) return item;

        return {
          ...item,
          answersList: item.answersList.map((answer) =>
            answer.author === giftTarget.acc_address
              ? { ...answer, gifts: answer.gifts + 1 }
              : answer,
          ),
        };
      }),
    );

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
                  <p style={{ marginTop: "1rem" }}>{item.question}</p>
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
                  const response = await Fetch_to(json_route.feeds.hearts, { id: item.id, acc_address: acc_address });
                  
                  if (response.success) {
                    setRefresh(true);
                    setTimeout(() => setRefresh(false), 500);
                  } else {
                    setRefresh(true);
                    setTimeout(() => setRefresh(false), 500);
                  }
                  
                }} type="button" className={styles.heart_button}>
                  <HeartIcon active />
                  <span >{item.hearts}</span>
                </button>
              </div>
            </article>
        ))}
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
                .sort(
                  (a, b) =>
                    new Date(b.time).getTime() - new Date(a.time).getTime()
                ).map((answer) => (
                  <article key={`${answer.id}-${answer.author}`} className={styles.answer_item}>
                    <div className={styles.answer_item_head}>
                      <strong>{answer.acc_address === acc_address ? "You" : answer.author + " " + answer.context + " Wallets"}</strong>
                      <span>{formatTimeAgo(answer.time)}</span>
                    </div>
                    <p style={{ whiteSpace: "pre-line" }} >{answer.body}</p>
                    {answer.acc_address !== acc_address && (
                      <div className={styles.answer_item_footer}>
                        <button
                          type="button"
                          className={styles.gift_button}
                          onClick={() => handleOpenGift(activeQuestion.id, answer.acc_address, answer.author, answer.context)}
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
