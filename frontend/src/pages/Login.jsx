import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import collegeImg from "../assets/college.png";

const Login = () => {
  const [show, setShow] = useState(false);

  return (
    <section className="auth auth-login">
      <div
        className="auth-left"
        style={{ backgroundImage: `url(${collegeImg})` }}
        aria-hidden
      >
        <div className="overlay" />
        <div className="left-content" aria-hidden />
      </div>

      <div className="auth-right">
        <div className="card">
          <h3>Chatbot Login</h3>
          <p className="subtitle">Welcome back! Please log in to continue</p>

          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <label className="field">
              <span className="label">Email ID</span>
              <input type="email" placeholder="Enter your email" />
            </label>

            <label className="field">
              <span className="label">Password</span>
              <div className="password-field">
                <input
                  type={show ? "text" : "password"}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="eye"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <button className="auth-btn">Login</button>
          </form>

          <p className="switch-text">
            Don’t have an account? <Link to="/signup">Signup</Link>
          </p>

          <div className="divider">or</div>

          <button className="google-btn">Login with Google</button>
        </div>
      </div>
    </section>
  );
};

export default Login;
