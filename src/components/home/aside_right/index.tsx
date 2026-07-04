import styles from "./css/styles.module.css";
// import { Dispatch, SetStateAction } from "react";

// type Aside_rightProps = {

// }

export default function Aside_right() {
  return(
    <section className={styles.container}>
      <div className={styles.panel}>
        <div className={styles.panel_top}>
          <h3>Recommend on AskVerse</h3>
          <button type="button" className={styles.burger} aria-label="Open trending">
            <span />
            <span />
            <span />
          </button>
        </div>
        <ul>
          <li>Stellar rewards for contributors</li>
          <li>How to earn by answering well</li>
          <li>Welcome to AskVerse</li>
        </ul>
      </div>

      <div className={styles.panel}>
        <div className={styles.panel_top}>
          <h3>Guidance</h3>
          <button type="button" className={styles.burger} aria-label="Open guidance">
            <span />
            <span />
            <span />
          </button>
        </div>
        <p>
          Ask questions, post answers, upvote the best responses, and earn token rewards for quality contributions.
        </p>
      </div>
    </section>
  );
}
