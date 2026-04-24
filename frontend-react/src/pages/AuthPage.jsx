import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

const BASE_URL = "https://iam-project.onrender.com";
const SITE_KEY = "6LdXVcYsAAAAAP9I3xwxYhBLbANLirzHUs4LU_SB";

export default function AuthPage() {
  const [tab, setTab] = useState("login");

 
 

  // 🔥 ADDED STATES (DO NOT REMOVE ABOVE)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");

  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");

  const [generatedPw, setGeneratedPw] = useState("");
  const [pwLength, setPwLength] = useState(12);
  const [pwError, setPwError] = useState("");

  const [captcha, setCaptcha] = useState(null);

  // MFA
  const [showLoginOtp, setShowLoginOtp] = useState(false);
  const [loginOtp, setLoginOtp] = useState("");
  const [tempUser, setTempUser] = useState("");

  const navigate = useNavigate();

  // 🔥 ONLY CHANGE: password → regPassword
  const rules = {
    length: regPassword.length >= 8,
    lower: /[a-z]/.test(regPassword),
    upper: /[A-Z]/.test(regPassword),
    special: /[@$!%*?&]/.test(regPassword),
  };

  const inputStyle = {
    width: "90%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "none",
    outline: "none",
  };

  const btnStyle = {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#00c6ff",
    color: "#fff",
    cursor: "pointer",
    marginTop: "10px",
  };

  const cardStyle = {
    width: "380px",
    padding: "25px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    textAlign: "center",
  };

  // LOGIN
  const login = async () => {
    if (!captcha) return alert("Verify CAPTCHA ❌");

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      // 🔥 CHANGED ONLY THIS LINE
      body: JSON.stringify({ username: loginEmail, password: loginPassword, captcha }),
    });

    const data = await res.json();

    if (data.mfa) {
      setShowLoginOtp(true);
      setTempUser(loginEmail);
      alert("OTP sent 🔐");
    } else {
      alert(data.message);
    }
  };

  // VERIFY OTP
  const verifyLoginOtp = async () => {
    const res = await fetch(`${BASE_URL}/auth/verify-login-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username: tempUser, otp: loginOtp }),
    });

    const data = await res.json();

    if (res.ok) {
      // 🔥 ADDED ONLY
      setLoginEmail("");
      setLoginPassword("");

      navigate("/dashboard");
    } else {
      alert(data.message);
    }
  };

  // REGISTER
  const register = async () => {
    if (!rules.length || !rules.lower || !rules.upper || !rules.special) {
      return alert("Password not strong ❌");
    }

    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 🔥 CHANGED ONLY THIS LINE
      body: JSON.stringify({ username: regEmail, password: regPassword }),
    });

    const data = await res.json();
    alert(data.message || data.errors?.[0]?.msg);
  };

  // SEND OTP
  const sendOtp = async () => {
    const res = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 🔥 CHANGED ONLY THIS LINE
      body: JSON.stringify({ username: forgotEmail }),
    });

    const data = await res.json();
    alert(data.message);
  };

  // RESET PASSWORD
  const resetPassword = async () => {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 🔥 CHANGED ONLY THIS LINE
      body: JSON.stringify({
        username: forgotEmail,
        otp,
        newPassword: newPass,
      }),
    });

    const data = await res.json();
    alert(data.message);
  };

  // PASSWORD GENERATOR (UNCHANGED)
  const generatePassword = async () => {
    if (pwLength < 8 || pwLength > 32) {
      return setPwError("8-32 only ❌");
    }

    const res = await fetch(
      `${BASE_URL}/auth/generate-password?length=${pwLength}`
    );

    const data = await res.json();
    setGeneratedPw(data.password);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "40px",
        color: "white",
      }}
    >
      <h1>Secure Auth 🔐</h1>

      {/* Tabs */}
      <div style={{ marginBottom: "20px" }}>
        {["login", "register", "forgot"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              margin: "5px",
              padding: "8px 15px",
              borderRadius: "8px",
              border: "none",
              background: tab === t ? "#00c6ff" : "#eee",
              color: tab === t ? "#fff" : "#000",
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* MAIN CARD */}
      <div style={cardStyle}>
        {tab === "login" && (
          <>
            {/* 🔥 CHANGED ONLY */}
            <input
              style={inputStyle}
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />

            <input
              style={inputStyle}
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />

            <div style={{ margin: "15px 0" }}>
              <ReCAPTCHA sitekey={SITE_KEY} onChange={setCaptcha} />
            </div>

            {!showLoginOtp && (
              <button style={btnStyle} onClick={login}>
                Login
              </button>
            )}

            {showLoginOtp && (
              <>
                <input
                  style={inputStyle}
                  placeholder="Enter OTP"
                  value={loginOtp}
                  onChange={(e) => setLoginOtp(e.target.value)}
                />
                <button style={btnStyle} onClick={verifyLoginOtp}>
                  Verify OTP
                </button>
              </>
            )}
          </>
        )}

        {tab === "register" && (
          <>
            {/* 🔥 CHANGED ONLY */}
            <input
              style={inputStyle}
              placeholder="Email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />

            <input
              style={inputStyle}
              type="password"
              placeholder="Password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
            />

            {/* PASSWORD RULE BOX */}
            <div style={{ textAlign: "left", fontSize: "13px" }}>
              <p style={{ color: rules.length ? "lime" : "red" }}>
                ✔ Min 8 characters
              </p>
              <p style={{ color: rules.lower ? "lime" : "red" }}>
                ✔ Lowercase
              </p>
              <p style={{ color: rules.upper ? "lime" : "red" }}>
                ✔ Uppercase
              </p>
              <p style={{ color: rules.special ? "lime" : "red" }}>
                ✔ Special char (@$!%*?&)
              </p>
            </div>

            <button
              style={btnStyle}
              onClick={register}
              disabled={
                !rules.length ||
                !rules.lower ||
                !rules.upper ||
                !rules.special
              }
            >
              Register
            </button>
          </>
        )}

        {tab === "forgot" && (
          <>
            {/* 🔥 CHANGED ONLY */}
            <input
              style={inputStyle}
              placeholder="Email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />

            <button style={btnStyle} onClick={sendOtp}>
              Send OTP
            </button>

            <input
              style={inputStyle}
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <input
              style={inputStyle}
              placeholder="New Password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />

            <button style={btnStyle} onClick={resetPassword}>
              Reset Password
            </button>
          </>
        )}
      </div>

      {/* PASSWORD GENERATOR (UNCHANGED — STILL HERE ✅) */}
      <div style={{ ...cardStyle, marginTop: "30px" }}>
        <h3>Password Generator 🔐</h3>

        <input
          style={inputStyle}
          type="number"
          value={pwLength}
          onChange={(e) => setPwLength(e.target.value)}
        />

        <p style={{ color: "red" }}>{pwError}</p>

        <button style={btnStyle} onClick={generatePassword}>
          Generate
        </button>

        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            background: "#000",
            borderRadius: "10px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>{generatedPw || "Your password will appear here"}</span>

          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedPw);
              alert("Copied ✅");
            }}
          >
            📋
          </button>
        </div>
      </div>
    </div>
  );
}