"use client"
import { PeraWalletConnect } from "@perawallet/connect";
import { useEffect, useState } from "react";
import { FaUser, FaHeart, FaComment, FaRetweet } from 'react-icons/fa';
import algosdk from 'algosdk';
import { NetworkId, useWallet } from '@txnlab/use-wallet-react';
import React from "react";

const peraWallet = new PeraWalletConnect();

export default function Home() {
  const {
    algodClient,
    activeAddress,
    setActiveNetwork,
    transactionSigner,
    wallets
  } = useWallet();
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const isConnectedToPeraWallet = !!accountAddress;
  const [posts, setPosts] = useState([
    { id: 1, walletAddress: "K4NC7MHO3JDICHDJVDOTXLVTKBP3OYMUEQW7BKB4VISA7CP2Z7HRLJ4YWQ", content: "This is the content of post number 1. It can contain text, images, or links." },
    { id: 2, walletAddress: "K4NC7MHO3JDICHDJVDOTXLVTKBP3OYMUEQW7BKB4VISA7CP2Z7HRLJ4YWQ", content: "This is the content of post number 2. It can contain text, images, or links." },
    { id: 3, walletAddress: "K4NC7MHO3JDICHDJVDOTXLVTKBP3OYMUEQW7BKB4VISA7CP2Z7HRLJ4YWQ", content: "This is the content of post number 3. It can contain text, images, or links." },
  ]);
  const [newPostContent, setNewPostContent] = useState("");

  console.log(accountAddress);

  useEffect(() => {
    // Reconnect to the session when the component is mounted
    peraWallet
      .reconnectSession()
      .then((accounts : string[]) => {
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);

        if (accounts.length) {
          setAccountAddress(accounts[0]);
        }
      })
      .catch((e: Error) => console.log(e));
  }, []);

  function handleConnectWalletClick() {
    // peraWallet
    wallets[0]
      .connect()
      .then((newAccounts) => {
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
        setAccountAddress(newAccounts[0].address);
        // Update activeAddress
        setActiveNetwork(NetworkId.TESTNET);
        wallets[0].setActiveAccount(newAccounts[0].address)
        console.log(activeAddress)
      })
      .catch((error) => {
        if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
          console.log(error);
        }
      });
  }

  function handleDisconnectWalletClick() {
    wallets[0].disconnect();

    setAccountAddress(null);
  }

  function handlePostSubmit() {
    if (newPostContent.trim() !== "" && accountAddress) {
      const newPost = {
        id: posts.length + 1,
        walletAddress: accountAddress,
        content: newPostContent,
      };
      setPosts([newPost, ...posts]);
      setNewPostContent("");
    }
  }

  async function handleDonate(walletAddress: string, amount: number) {
    try {
      if (!accountAddress || !activeAddress) {
        throw new Error('[App] No active wallet. Please connect a wallet first.')
      }

      const atc = new algosdk.AtomicTransactionComposer()
      const suggestedParams = await algodClient.getTransactionParams().do()
      const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        suggestedParams: suggestedParams,
        from: accountAddress,
        to: walletAddress,
        amount: amount * 1000000,
      });
      
      atc.addTransaction({ txn: transaction, signer: transactionSigner })


      try {
        const result = await atc.execute(algodClient, 2)
        console.info(`[App] ✅ Transaction sent successfully!`, {
          confirmedRound: result.confirmedRound,
          txIDs: result.txIDs
        })
        alert('Transaction sent successfully!')
      } catch (error) {
        console.error('[App] Error signing transaction:', error)
      } finally {
      }
    } catch (error) {
      console.error('[App] Error signing transaction:', error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">AlgoBlog</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-full"
          onClick={
            isConnectedToPeraWallet
              ? handleDisconnectWalletClick
              : handleConnectWalletClick
          }
        >
          {isConnectedToPeraWallet ? "Disconnect" : "Connect to Pera Wallet"}
        </button>
      </header>

      <main>
        {isConnectedToPeraWallet && (
          <div className="mb-8">
            <textarea
              className="w-full p-4 border rounded-lg"
              placeholder="What's on your mind?"
              rows={3}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            ></textarea>
            <button 
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-full"
              onClick={handlePostSubmit}
            >
              Post
            </button>
          </div>
        )}

        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FaUser className="mr-2" />
                  <span className="font-semibold">User {post.id}</span>
                </div>
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded-full text-sm"
                  onClick={() => handleDonate(post.walletAddress, 1)}
                >
                  Donate
                </button>
              </div>
              <p className="mb-2">{post.content}</p>
              <p className="text-sm text-gray-500 mb-4">Wallet address: {post.walletAddress}</p>
              <div className="flex space-x-4">
                <button className="flex items-center">
                  <FaHeart className="mr-1" /> 10
                </button>
                <button className="flex items-center">
                  <FaComment className="mr-1" /> 5
                </button>
                <button className="flex items-center">
                  <FaRetweet className="mr-1" /> 2
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
