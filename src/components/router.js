import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { WalletAddressContext } from "../context";
import Login from "../components/Login/index";
import Profile from "../components/Profile/index";

export default function RouterComponent() {
  const [walletAddress, setWalletAddress] = useState('');
  const value = { walletAddress, setWalletAddress };
  return (
    <WalletAddressContext.Provider value={value}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/profile/:githubId/:walletAddress"
            element={<Profile />}
          />
        </Routes>
      </Router>
    </WalletAddressContext.Provider>
  );
}
