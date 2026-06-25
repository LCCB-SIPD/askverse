"use client";
import { ConnectWalletBT, useWalletModal, useWalletStatus, useDisconnectWallets } from "@cordystackx/cordy_minikit";
import styles from "./css/styles.module.css";
import { useEffect, useState } from "react";
import json_route from "@/config/json_route/route.json";
import json_link from "@/config/json_links/navigations.json";
import { Fetch_to } from "@/utilities";
import { useRouter } from "next/navigation";

export default function Sign_in() {
  const router = useRouter();
  const { closeModal, openModal } = useWalletModal();
  const {
    context,
    evm,
    stellar,
    refreshBalances
  } = useWalletStatus();
  const { disconnectAll, disconnectStellar, disconnectEVM } = useDisconnectWallets();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      (context === "NONE")
    ) {
      return;
    }

    const signIn = async () => {
      setLoading(true);
      closeModal();
      await refreshBalances();

      const address =
        context === "EVM"
          ? evm.address
          : stellar.address;

      const response = await Fetch_to(
        json_route.auth.sign_in,
        {
          acc_address: address,
          context
        }
      );

      if (response.success) {
        if (context === "EVM") await disconnectStellar();
        if (context === "Non-EVM") await disconnectEVM();
        router.push(json_link.signed.home);
      } else {
        alert(response.message);
        handleDisconnect();
        return;
      }
    };

    signIn();
  }, [context]);

  async function handleDisconnect() {                                                                                
    const success = await disconnectAll();                                                                           
                                                                                                                      
    if (success) {                                                                                                   
      console.log("Wallets disconnected");
      setLoading(false);                                                                         
    } else {                                                                                                         
      console.log("Failed to disconnect wallets");
      setLoading(false);                                                              
    }                                                                                                                
  } 

  useEffect(() => {
    if (context === "EVM" || context === "Non-EVM") {
      closeModal();
    }
  }, [openModal]);

  return (
    <section className={styles.container}>
      <div className={styles.glow_left} />
      <div className={styles.glow_right} />
      <div className={styles.wrapper}>
        <div className={styles.sign_in_contain}>
          <p className={styles.kicker}>Secure access</p>
          <h1>Connect your wallet to enter AskVerse.</h1>
          <p className={styles.lead}>
            Use Stellar or your connected wallet to join the knowledge-to-earn network
            and start building reputation through verified contributions.
          </p>

          <div className={styles.button_wrap}>
            {loading ? (
              <h3>Loading...</h3>
            ) : (
              <ConnectWalletBT className={styles.wallet_button} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
