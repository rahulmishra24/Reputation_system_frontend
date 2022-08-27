import React, { useState, useEffect, useContext } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { WalletAddressContext } from "../../context";
import idl from "../../idl.json";
import { useNavigate } from "react-router-dom";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
import kp from "../../keypair.json";
import bs58 from "bs58";
import "./profile.css";

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl("devnet");

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed",
};
export default function Profile() {
  const { githubId } = useParams();
  const walletAddressUrl = useParams().walletAddress;
  const [searchParams, setSearchParams] = useSearchParams();
  const { walletAddress, setWalletAddress } = useContext(WalletAddressContext);
  const [githubData, setGithubData] = useState([]);
  const [recentWork, setRecentWork] = useState({});
  const [githubEventData, setGithubEventData] = useState([]);
  const [totalCommits, setTotalCommits] = useState(0);
  const [accountList, setAccountList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get("linkShare")) {
      console.log(walletAddressUrl);
      setWalletAddress(walletAddressUrl);
    }
    axios
      .all([
        axios.get(`https://api.github.com/users/${githubId}/events`),
        axios.get(`https://api.github.com/users/${githubId}`),
      ])

      .then(
        axios.spread((response1, response2) => {
          console.log(response2);
          setGithubData(response2.data);
          setGithubEventData(response1.data);
          setRecentWork(getRecentWork(response1.data));
        })
      )
      .catch((err) => {
        alert("Please enter valid github id");
        navigate(`/`);
      });
    // if (walletAddress) {
    console.log("Fetching Account list...");
    getAccountDetails();
    //  }
  }, [walletAddress]);
  console.log(walletAddress);
  const createProfileAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping");
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        "Created a new BaseAccount w/ address:",
        baseAccount.publicKey.toString()
      );
      await getAccountDetails();
    } catch (error) {
      console.log("Error creating BaseAccount account:", error);
    }
  };

  const getAccountDetails = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log("Got the account", account);
      console.log(walletAddress);
      //converts words to address
      setAccountList(account.profileList);
    } catch (error) {
      console.log("Error in getAccountDetails: ", error);
      setAccountList(null);
    }
  };

  const addProfile = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log(provider.wallet.publicKey);
      await program.rpc.addProfile(githubData.url, "", {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("Profile successfully sent to program", githubData.url);

      await getAccountDetails();
    } catch (error) {
      console.log("Error sending Profile:", error);
    }
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const getRecentWork = (events) => {
    let lastCommit;

    events.some((event) => {
      return (
        event.type === "PushEvent" &&
        event.payload.commits.reverse().some((commit) => {
          // if (commit.author.email === EMAIL) {
          lastCommit = {
            repo: event.repo.name,
            sha: commit.sha,
            time: new Date(event.createdAt),
            message: commit.message,
            url: commit.url,
          };

          return true;
          // }
        })
      );
    });
    return lastCommit;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      `http://localhost:3000/profile/${githubId}/${walletAddress}/?linkShare=share`
    );
  };
  return (
    <div className="profile-card">
      <div className="profile-card-right">
        <h2 className="profile-card-right-heading">
          On-chain Reputation System
        </h2>
      </div>
      <div className="profile-card-left">
        {accountList === null ? (
          <button
            className="profile-card-item profile-button"
            style={{padding:"2%"}}
            onClick={() => createProfileAccount()}
          >
            Do One-Time Initialization For SOLREPUTE Program Account
          </button>
        ) : null}
        <h1 className="profile-card-item profile-heading">
          Profile{" "}
          {accountList && accountList.some(function (account) {
            return account.userAddress.toString() === walletAddress;
          }) && <span className="tag">verified</span>}
        </h1>

        <hr className="profile-hr" />
        <div className="profile-column">
          <div className="profile-column-left">
            <h2>Off-Chain</h2>
            {githubData ? (
              <>
                <div>
                  <a herf={githubData.url}>{githubId}</a>
                  <p>GithubID</p>
                </div>
                {recentWork && (
                  <div>
                    <a herf={recentWork ? recentWork.repo : "#"}>
                      {recentWork.repo && recentWork.repo.split("/").pop()}
                    </a>
                    <p>Recent Work</p>
                  </div>
                )}
                <div>
                  <a herf={githubData.repos_url}>{githubData.public_repos}</a>
                  <p>Repositories</p>
                </div>
                {/* <div>
              <p>{totalCommits}</p>
              <p>Total Commits</p>
            </div> */}
              </>
            ) : (
              <p>No Off-chain data</p>
            )}
          </div>
          <div className="profile-column-right">
            <h2>On-Chain</h2>
            <div>
              <p>NFTs</p>
            </div>
            <div>
              <p>Courses</p>
            </div>
            <div>
              <p>Balance</p>
            </div>
          </div>
        </div>
        <div className="profile-column">
          <div className="profile-column-left-like">
            <button className="profile-card-item profile-button"
            style={{alignSelf:'center'}}>Like</button>
            <button className="profile-card-item profile-button"
            style={{alignSelf:'center'}}>
              Dislike
            </button>
          </div>
          <div className="profile-column-right">
            <button
              className="profile-card-item profile-button"
              style={{alignSelf:'flex-end',width: "max-content"}}
              onClick={() => copyToClipboard()}
            >
              Get sharable link
            </button>
            {!searchParams.get("linkShare") && accountList != null && (
              <button
                className="profile-card-item profile-button"
                style={{alignSelf:'flex-end',width: "max-content"}}
                onClick={() => addProfile()}
              >
                Store On-Chain
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
