"use client";

import { useState } from "react";
import {
  Content_feed,
  Aside_left,
  Aside_right,
  Header,
  Profile,
} from "@/components/home";
import { useEffect } from "react";
import { Fetch_to } from "@/utilities";
import json_route from "@/config/json_route/route.json";
import { useWalletStatus, useDisconnectWallets } from "@cordystackx/cordy_minikit";
import { useRouter } from "next/navigation";

export default function Home_page() {
  const router = useRouter();
  const [questionComposerOpen, setQuestionComposerOpen] = useState(false);
  const [questionDraft, setQuestionDraft] = useState("");
  const [bodyDraft, setBodyDraft] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [globalLoading, setGlobalLaoding] = useState(false);
  const { context, evm, stellar } = useWalletStatus();
  const { disconnectAll } = useDisconnectWallets();

  useEffect(() => {
    async function Retrieve() {
      const address = context === "EVM" ? evm.address : stellar.address;
      const response = await Fetch_to(json_route.info.retrieve, { acc_address: address });

      if (context === "MULTI") {
        await disconnectAll();
        return router.push("/");
      }

      if (response.success) {
        const result = response.data.message[0];
        setDisplayName(result.author);
        setUsername("@" + result.username);
      } else {
        router.push("/");
      }
    }
    Retrieve();
  }, []);

  const handleCloseComposer = () => {
    setQuestionComposerOpen(false);
    setQuestionDraft("");
  };

  return (
    <main className="homepage">
      <Header onPostQuestionClick={() => setQuestionComposerOpen((current) => !current)} />
      <div className="homepage_shell">
        <Aside_left displayName={displayName} username={username} context={context} evm={`${evm.address}`} stellar={`${stellar.address}`} setDisplayName={setDisplayName} setUsername={setUsername} />
        <Content_feed displayName={displayName} context={context} acc_address={`${context === "EVM" ? evm.address : stellar.address}`} />
        <Aside_right />
        <Profile />
      </div>

      {questionComposerOpen && (
        <div className="question_composer_overlay" role="presentation" onClick={handleCloseComposer}>
          <div
            className="question_composer"
            role="dialog"
            aria-modal="true"
            aria-label="Create question"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="question_composer_head">
              <div>
                <p>New question</p>
                <h3>Ask the community for help</h3>
              </div>
            </div>
            <label htmlFor="question-draft">Your question</label>
            <textarea
              id="question-draft"
              value={questionDraft}
              onChange={(event) => setQuestionDraft(event.target.value)}
              placeholder="What do you want to ask?"
            />

            <textarea
              id="question-draft"
              value={bodyDraft}
              onChange={(event) => setBodyDraft(event.target.value)}
              placeholder="Describe your problem in detail. Include relevant code snippets, error messages, steps to reproduce the issue, and what you've already attempted."
            />

            <div className="question_composer_actions">
              <button type="button" onClick={handleCloseComposer}>Cancel</button>
              <button type="button" onClick={async() => {
                setGlobalLaoding(true);
                const response = await Fetch_to(json_route.feeds.post, {
                  author: displayName,
                  question: questionDraft,
                  body: bodyDraft,
                  acc_address: context === "EVM" ? evm.address : stellar.address
                });

                if (response.success) {
                  alert(response.data.message);
                  setBodyDraft("");
                  setQuestionDraft("");
                  setGlobalLaoding(false);
                  window.location.reload();
                } else {
                  alert(response.message);
                  setGlobalLaoding(false);
                }

              }}> {globalLoading ? "Uploading" : "Ask Question"} </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
