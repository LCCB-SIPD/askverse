"use client";

import { useState, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useDisconnectWallets } from "@cordystackx/cordy_minikit";
import styles from "./css/styles.module.css";

type Aside_leftProps = {
  username?: string;
  displayName?: string;
  context?: string;
  evm?:string;
  stellar?:string;
  setDisplayName: Dispatch<SetStateAction<string>>;
  setUsername: Dispatch<SetStateAction<string>>;
}

export default function Aside_left({ displayName, username, context, evm, stellar, setDisplayName, setUsername } : Aside_leftProps) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const { disconnectAll } = useDisconnectWallets();
  const [loading, setLoading] = useState(false);

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
            <div className={styles.avatar}>AV</div>
            <div>
              <strong>{displayName}</strong>
              <p>{username}</p>
            </div>
          </button>
          <button type="button" className={styles.burger} aria-label="Open navigation">
            <span />
            <span />
            <span />
          </button>
        </div>
        <nav className={styles.nav}>
          <ul>
            <li onClick={() => {}}>Home</li>
            <li onClick={() => {}}>My Questions</li>
          </ul>
        </nav>
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
              <button type="button" onClick={() => setProfileOpen(false)}>
                Update
              </button>
              <button style={{ backgroundColor: "#f00" }} type="button" onClick={() => handleDisconnect()}>
                {loading ? "Loading..." : "Disconnect Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
