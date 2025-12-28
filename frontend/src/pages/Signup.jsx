import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Signup.css";
import bg from "../assets/college-bg.png";
import logo from "../assets/college-logo.png";

const Signup = () => {
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  return (
    <section className="auth auth-signup">
      <div
        className="auth-left"
        style={{ backgroundImage: `url(${bg})` }}
        aria-hidden
      >
        <div className="overlay" />
        <div className="left-content">
          <img
            src={logo}
            alt="Vimala College"
            className="college-logo"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="64"><rect width="100%" height="100%" fill="%23e9f2fb"/><text x="50%" y="50%" alignment-baseline="middle" text-anchor="middle" fill="%23345" font-family="Arial, Helvetica, sans-serif" font-size="14">Vimala College</text></svg>';
            }}
          />
        </div>
      </div>

      <div className="auth-right">
        <div className="card">
          <h3>Chatbot Signup</h3>
          <p className="subtitle">Create an account to continue</p>

          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <label className="field">
              <span className="label">Full Name</span>
              <input type="text" placeholder="Enter your full name" />
            </label>

            <label className="field">
              <span className="label">Email ID</span>
              <input type="email" placeholder="Enter your email" />
            </label>

            <label className="field">
              <span className="label">Password</span>
              <div className="password-field">
                <input type={show1 ? "text" : "password"} placeholder="Password" />
                <button type="button" className="eye" onClick={() => setShow1((s) => !s)}>
                  {show1 ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <label className="field">
              <span className="label">Confirm Password</span>
              <div className="password-field">
                <input type={show2 ? "text" : "password"} placeholder="Confirm Password" />
                <button type="button" className="eye" onClick={() => setShow2((s) => !s)}>
                  {show2 ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <button className="auth-btn">Sign up</button>
          </form>

          <p className="switch-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>

          <div className="divider">or</div>

          <button className="google-btn">Login with Google</button>
        </div>
      </div>
    </section>
  );
};

export default Signup;
