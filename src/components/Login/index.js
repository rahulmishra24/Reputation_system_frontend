import React, { useState,useContext} from "react";
import { useNavigate } from "react-router-dom";
import {WalletAddressContext} from "../../context";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  const { walletAddress, setWalletAddress } = useContext(WalletAddressContext);
  const [githubId, setGithubId] = useState("");

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found!");
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            "Connected with Public Key:",
            response.publicKey.toString()
          );

          /*
           * Set the user's publicKey in state to be used later!
           */
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("Solana object not found! Get a Phantom Wallet 👻");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log("Connected with Public Key:", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const handleSubmit = () => {
    if (githubId === "") {
      alert("Enter github id");
    } 
    if (!walletAddress) {
      alert("Please connect you wallet");
    } else {
      navigate(`/profile/${githubId}/${walletAddress}`);
    }
  };
  return (
    <div className="login-card">
      <div className="login-card-right">
        <h2 className="login-card-right-heading">On-chain Reputation System</h2>
      </div>
      <div className="login-card-left">
        <h1 className="login-card-item login-heading">Login Form </h1>
        <label className="login-label">Github Id</label>
        <input
          className="login-card-item login-input"
          placeholder="Enter your Github Id"
          type="text"
          value={githubId}
          onChange={(e) => setGithubId(e.target.value)}
        />
        {walletAddress ? (
          <p className="login-card-item">{walletAddress}</p>
        ) : (
          <button
            className="login-card-item login-button"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
        <button
          className="login-card-item login-button"
          onClick={() => handleSubmit()}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
