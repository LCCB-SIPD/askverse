"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./css/styles.module.css";
import { Fetch_to } from "@/utilities";
import json_route from "@/config/json_route/route.json";

type RankedUser = {
  author: string;
  username: string;
  upVotes: number;
  acc_address: string;
};

function shortWallet(address: string) {
  if (!address) return "Unknown wallet";
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Leader_boards() {
  const [rankedUsers, setRankedUsers] = useState<RankedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function retrieveLeaders() {
      setLoading(true);

      const response = await Fetch_to(json_route.info.retrieve, {
        leaderboard: true,
        limit: 10,
      });

      if (cancelled) return;

      if (response.success) {
        setRankedUsers(
          (response.data.message ?? []).map((user: {
            author?: string;
            username?: string;
            over_all_upvote?: number;
            acc_address?: string;
          }) => ({
            author: user.author || "Anonymous",
            username: user.username || "No username",
            upVotes: Number(user.over_all_upvote || 0),
            acc_address: user.acc_address || "",
          })),
        );
      }

      setLoading(false);
    }

    retrieveLeaders();

    return () => {
      cancelled = true;
    };
  }, []);

  const topUser = useMemo(() => rankedUsers[0] ?? null, [rankedUsers]);

  return(
    <section className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.hero}>
          <div>
            <span className={styles.kicker}>Leader Boards</span>
            <h1>Top up-voted creators</h1>
            <p>Users ranked by their saved total up-vote score.</p>
          </div>

          <div className={styles.top_card}>
            <span className={styles.rank_badge}>#1</span>
            {loading ? (
              <div className={styles.skeleton_block} />
            ) : topUser ? (
              <>
                <div className={styles.avatar}>{topUser.author.slice(0, 1).toUpperCase()}</div>
                <strong>{topUser.author}</strong>
                <p>{topUser.upVotes.toLocaleString()} up-vote points</p>
                <span>{shortWallet(topUser.acc_address)}</span>
              </>
            ) : (
              <>
                <div className={styles.avatar}>A</div>
                <strong>No leader yet</strong>
                <p>Answer questions and earn gifts to appear here.</p>
              </>
            )}
          </div>
        </div>

        <div className={styles.board}>
          <div className={styles.board_head}>
            <span>Rank</span>
            <span>User</span>
            <span>Wallet</span>
            <span>Username</span>
            <span>Up Votes</span>
          </div>

          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div className={styles.row} key={index}>
                <div className={styles.skeleton_circle} />
                <div className={styles.skeleton_line} />
                <div className={styles.skeleton_line} />
                <div className={styles.skeleton_line} />
                <div className={styles.skeleton_line} />
              </div>
            ))
          ) : rankedUsers.length > 0 ? (
            rankedUsers.map((user, index) => (
              <article className={index === 0 ? styles.row_top : styles.row} key={user.acc_address || user.author}>
                <strong className={styles.rank}>#{index + 1}</strong>
                <div className={styles.user_cell}>
                  <span className={styles.small_avatar}>{user.author.slice(0, 1).toUpperCase()}</span>
                  <div>
                    <strong>{user.author}</strong>
                    <p>{user.username}</p>
                  </div>
                </div>
                <span>{shortWallet(user.acc_address)}</span>
                <span>{user.username}</span>
                <strong>{user.upVotes.toLocaleString()}</strong>
              </article>
            ))
          ) : (
            <div className={styles.empty}>
              <strong>No ranked users yet</strong>
              <p>When users receive up-vote gifts, the top users will show here.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
