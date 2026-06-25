"use client";

import { useState } from "react";
import styles from "./css/styles.module.css";

type HeaderProps = {
  onPostQuestionClick: () => void;
};

export default function Header({ onPostQuestionClick }: HeaderProps) {
  const [searchValue, setSearchValue] = useState("");

  return(
    <header className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.brand}>
          <span className={styles.mark}>A</span>
          <div>
            <strong>AskVerse</strong>
            <p>Knowledge-to-earn</p>
          </div>
        </div>
        <div className={styles.search}>
          <input
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search AskVerse"
            aria-label="Search AskVerse"
          />
        </div>
        <button type="button" className={styles.action} onClick={onPostQuestionClick}>
          Ask Question
        </button>
      </div>
    </header>
  );
}
