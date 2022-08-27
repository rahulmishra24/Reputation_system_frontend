import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import RouterComponent from "./components/router";
import Logo from "./logo.png";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <div style={{width:'13rem',height:'8rem',margin:'1rem 0 0 1rem'}}>
      <img style={{width:'100%',overflow:'hidden',borderRadius:'50%'}} src={Logo} alt="logo" />
    </div>
    {/* <h1 style={{margin:'1rem 0 0 1rem',letterSpacing:'0.6rem'}}>SOLREPUTE</h1> */}
    <RouterComponent />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
