"use client";

import { useState, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useDisconnectWallets } from "@cordystackx/cordy_minikit";
import styles from "./css/styles.module.css";
import { Fetch_to } from "@/utilities";
import json_route from "@/config/json_route/route.json";

type Aside_leftProps = {
  username?: string;
  displayName?: string;
  context?: string;
  evm?:string;
  stellar?:string;
  balance?: string;
  upvote: string;
  setDisplayName: Dispatch<SetStateAction<string>>;
  setUsername: Dispatch<SetStateAction<string>>;
  setFilter: Dispatch<SetStateAction<boolean>>;
}

function getProfileInitial(displayName?: string, username?: string) {
  const name = displayName?.trim() || username?.trim() || "A";
  return name.slice(0, 1).toUpperCase();
}

export default function Aside_left({ upvote, displayName, username, context, evm, stellar, setDisplayName, setUsername, setFilter, balance } : Aside_leftProps) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { disconnectAll } = useDisconnectWallets();
  const [loading, setLoading] = useState(false);
  const profileInitial = getProfileInitial(displayName, username);

  async function handleDisconnect() {
    setLoading(true);                                                                            
    const success = await disconnectAll();                                                                           
                                                                                                                      
    if (success) {                                                                                                   
      console.log("Wallets disconnected");
      router.push("/");                                                                       
    }else {                                                                                                         
      console.log("Failed to disconnect wallets");
      setLoading(false);
    }
  }

  return(
    <aside className={styles.container}>
      <div className={styles.panel}>
        <div className={styles.panel_top}>
          <button
            type="button"
            className={styles.profile_button}
            onClick={() => setProfileOpen(true)}
          >
            <div className={styles.avatar}>{profileInitial}</div>
            <div>
              <strong>{displayName}</strong>
              <p style={{ margin: "0.2rem" }}>@{username}</p>
            </div>
          </button>
          <button type="button" className={styles.burger} aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((prev) => !prev)}>
            <span />
            <span />
            <span />
          </button>
        </div>
        <div className={`${styles.mobile_menu} ${menuOpen ? styles.mobile_menu_open : ""}`}>
          <div className={styles.stats}>
            <article>
              <span>Balance</span>
              <strong>{Number(balance || 0).toFixed(2)}</strong>
            </article>
            <article>
              <span>UpVote Score</span>
              <strong>{upvote || 0}</strong>
            </article>
          </div>
          <nav className={styles.nav}>
            <ul>
              <li onClick={() => { setFilter(false); setMenuOpen(false); }}>Feeds</li>
              <li onClick={() => { setFilter(true); setMenuOpen(false); }}>My Questions</li>
            </ul>
          </nav>
        </div>
      </div>

      {profileOpen && (
        <div className={styles.profile_overlay} role="presentation" onClick={() => setProfileOpen(false)}>
          <div
            className={styles.profile_modal}
            role="dialog"
            aria-modal="true"
            aria-label="Edit profile"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.profile_modal_head}>
              <div>
                <p>Profile</p>
                <h3>Edit your AskVerse identity</h3>
                <p>Wallet type: {context}</p>
              </div>
              <button type="button" onClick={() => setProfileOpen(false)}>
                Close
              </button>
            </div>

            <label htmlFor="display-name">Display name</label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />

            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />

            <label htmlFor="acc_address">Wallet Address</label>
            <input
              id="acc_address"
              type="text"
              value={`${context === "EVM" ? evm : stellar}`}
              disabled
            />

            <div className={styles.profile_actions}>
              <button disabled={loading} type="button" onClick={async() => {
                setLoading(true);
                const response = await Fetch_to(json_route.auth.update, { author: displayName, username, acc_address: context === "EVM" ? evm : stellar });
                if (response.success) {
                  setLoading(false);
                  alert(response.data.message);
                }else {
                  setLoading(false);
                  alert(response.message);
                }
              }}>
                {loading ? "Loading..." : "Update"}
              </button>
              <button disabled={loading} style={{ backgroundColor: "#f00" }} type="button" onClick={() => handleDisconnect()}>
                {loading ? "Loading..." : "Disconnect Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
