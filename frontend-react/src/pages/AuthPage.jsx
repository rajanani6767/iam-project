import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

const BASE_URL = "https://iam-project.onrender.com";
const SITE_KEY = "6LdXVcYsAAAAAP9I3xwxYhBLbANLirzHUs4LU_SB";

export default function AuthPage() {
  const [tab, setTab] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  // PASSWORD RULES
  const rules = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  // STYLES
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
      body: JSON.stringify({ username: email, password, captcha }),
    });

    const data = await res.json();

    if (data.mfa) {
      setShowLoginOtp(true);
      setTempUser(email);
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
      body: JSON.stringify({ username: email, password }),
    });

    const data = await res.json();
    alert(data.message || data.errors?.[0]?.msg);
  };

  // SEND OTP
  const sendOtp = async () => {
    const res = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email }),
    });

    const data = await res.json();
    alert(data.message);
  };

  // RESET PASSWORD
  const resetPassword = async () => {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: email,
        otp,
        newPassword: newPass,
      }),
    });

    const data = await res.json();
    alert(data.message);
  };

  // PASSWORD GENERATOR
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
            <input style={inputStyle} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input style={inputStyle} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

            <div style={{ margin: "15px 0" }}>
              <ReCAPTCHA sitekey={SITE_KEY} onChange={setCaptcha} />
            </div>

            {!showLoginOtp && <button style={btnStyle} onClick={login}>Login</button>}

            {showLoginOtp && (
              <>
                <input style={inputStyle} placeholder="Enter OTP" onChange={(e) => setLoginOtp(e.target.value)} />
                <button style={btnStyle} onClick={verifyLoginOtp}>Verify OTP</button>
              </>
            )}
          </>
        )}

        {tab === "register" && (
          <>
            <input style={inputStyle} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input style={inputStyle} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

            <div style={{ textAlign: "left", fontSize: "13px" }}>
              <p style={{ color: rules.length ? "lime" : "red" }}>✔ Min 8 characters</p>
              <p style={{ color: rules.lower ? "lime" : "red" }}>✔ Lowercase</p>
              <p style={{ color: rules.upper ? "lime" : "red" }}>✔ Uppercase</p>
              <p style={{ color: rules.special ? "lime" : "red" }}>✔ Special char</p>
            </div>

            <button style={btnStyle} onClick={register}>Register</button>
          </>
        )}

        {tab === "forgot" && (
          <>
            <input style={inputStyle} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <button style={btnStyle} onClick={sendOtp}>Send OTP</button>

            <input style={inputStyle} placeholder="OTP" onChange={(e) => setOtp(e.target.value)} />
            <input style={inputStyle} placeholder="New Password" onChange={(e) => setNewPass(e.target.value)} />

            <button style={btnStyle} onClick={resetPassword}>Reset Password</button>
          </>
        )}
      </div>

      {/* PASSWORD GENERATOR */}
      <div style={{ ...cardStyle, marginTop: "30px" }}>
        <h3>Password Generator 🔐</h3>

        <input style={inputStyle} type="number" value={pwLength} onChange={(e) => setPwLength(e.target.value)} />

        <p style={{ color: "red" }}>{pwError}</p>

        <button style={btnStyle} onClick={generatePassword}>Generate</button>

        <div style={{
          marginTop: "15px",
          padding: "10px",
          background: "#000",
          borderRadius: "10px",
          display: "flex",
          justifyContent: "space-between"
        }}>
          <span>{generatedPw || "Your password will appear here"}</span>

          <button onClick={() => {
            navigator.clipboard.writeText(generatedPw);
            alert("Copied ✅");
          }}>
            📋
          </button>
        </div>
      </div>
    </div>
  );
}