import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

const BASE_URL = "https://iam-project.onrender.com";
const SITE_KEY = "6LdXVcYsAAAAAP9I3xwxYhBLbANLirzHUs4LU_SB"; // 🔥 replace

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

  const navigate = useNavigate();

  // LOGIN
  const login = async () => {
    if (!captcha) return alert("Verify CAPTCHA ❌");

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: email,
        password,
        captcha,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Login Success ✅");
      navigate("/dashboard");
    } else {
      alert(data.message);
    }
  };

  // REGISTER
  const register = async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });

    const data = await res.json();

    if (data.errors) {
      alert(data.errors[0].msg);
    } else {
      alert(data.message);
    }
  };

  // PASSWORD GENERATOR
  const generatePassword = async () => {
    setPwError("");

    if (pwLength < 8) return setPwError("Minimum 8 ❌");
    if (pwLength > 32) return setPwError("Max 32 ❌");

    const res = await fetch(
      `${BASE_URL}/auth/generate-password?length=${pwLength}`
    );
    const data = await res.json();

    setGeneratedPw(data.password);
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

  return (
    <div
      style={{
        background: "#0a0a0a",
        minHeight: "100vh",
        color: "white",
        textAlign: "center",
        paddingTop: "30px",
      }}
    >
      <h2>Secure Auth 🔐</h2>

      {/* Tabs */}
      <div>
        <button onClick={() => setTab("login")}>Login</button>
        <button onClick={() => setTab("register")}>Register</button>
        <button onClick={() => setTab("forgot")}>Forgot</button>
      </div>

      {/* Main Card */}
      <div
        style={{
          width: "350px",
          margin: "30px auto",
          padding: "25px",
          background: "#111",
          borderRadius: "15px",
          boxShadow: "0 0 15px rgba(0,0,0,0.8)",
        }}
      >
        {tab === "login" && (
          <>
            <input
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />

            {/* 🔥 CAPTCHA ADDED */}
            <div style={{ margin: "10px 0" }}>
              <ReCAPTCHA
                sitekey={SITE_KEY}
                onChange={(val) => setCaptcha(val)}
              />
            </div>

            <button onClick={login}>Login</button>
          </>
        )}

        {tab === "register" && (
          <>
            <input
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <button onClick={register}>Register</button>
          </>
        )}

        {tab === "forgot" && (
          <>
            <input
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <button onClick={sendOtp}>Send OTP</button>
            <br />
            <input
              placeholder="OTP"
              onChange={(e) => setOtp(e.target.value)}
            />
            <br />
            <input
              placeholder="New Password"
              onChange={(e) => setNewPass(e.target.value)}
            />
            <br />
            <button onClick={resetPassword}>Reset</button>
          </>
        )}
      </div>

      {/* Password Generator Box */}
      <div
        style={{
          width: "350px",
          margin: "40px auto",
          padding: "20px",
          background: "#1a1a1a",
          borderRadius: "15px",
          boxShadow: "0 0 15px rgba(0,0,0,0.6)",
        }}
      >
        <h4>Password Generator 🔐</h4>

        <input
          type="number"
          value={pwLength}
          onChange={(e) => setPwLength(parseInt(e.target.value))}
        />

        <p style={{ color: "red" }}>{pwError}</p>

        <button onClick={generatePassword}>Generate</button>

        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            background: "#000",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>{generatedPw || "Your password will appear here"}</span>

          <button
            onClick={() => {
              if (!generatedPw) return;
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