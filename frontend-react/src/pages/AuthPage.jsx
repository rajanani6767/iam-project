import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://iam-project.onrender.com";

export default function AuthPage() {
  const [tab, setTab] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");

  const [generatedPw, setGeneratedPw] = useState("");
  const [pwLength, setPwLength] = useState(12);
  const [pwError, setPwError] = useState("");

  const navigate = useNavigate();

  // LOGIN
  const login = async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username: email, password }),
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

  // GENERATOR
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

    if (res.ok) {
      alert(data.message); // ✅ correct
    } else {
      alert(data.message);
    }
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
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Secure Auth 🔐</h2>

      {/* TABS */}
      <div>
        <button onClick={() => setTab("login")}>Login</button>
        <button onClick={() => setTab("register")}>Register</button>
        <button onClick={() => setTab("forgot")}>Forgot</button>
      </div>

      {/* 🔥 WRAPPED UI BOX */}
      <div
        style={{
          width: "350px",
          margin: "20px auto",
          padding: "20px",
          background: "#111",
          color: "white",
          borderRadius: "10px",
        }}
      >
        {/* LOGIN */}
        {tab === "login" && (
          <>
            <input
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            /><br /><br />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            /><br /><br />
            <button onClick={login}>Login</button>
          </>
        )}

        {/* REGISTER */}
        {tab === "register" && (
          <>
            <input
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            /><br /><br />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            /><br /><br />
            <button onClick={register}>Register</button>
          </>
        )}

        {/* FORGOT */}
        {tab === "forgot" && (
          <>
            <input
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            /><br /><br />

            <button onClick={sendOtp}>Send OTP</button><br /><br />

            <input
              placeholder="OTP"
              onChange={(e) => setOtp(e.target.value)}
            /><br /><br />

            <input
              placeholder="New Password"
              onChange={(e) => setNewPass(e.target.value)}
            /><br /><br />

            <button onClick={resetPassword}>Reset Password</button>
          </>
        )}
      </div>

      <hr />

      {/* GENERATOR */}
      <h4>Password Generator 🔐</h4>

      <input
        type="number"
        value={pwLength}
        onChange={(e) => setPwLength(parseInt(e.target.value))}
      />

      <p style={{ color: "red" }}>{pwError}</p>

      <button onClick={generatePassword}>Generate</button>

      <p>{generatedPw}</p>
    </div>
  );
}