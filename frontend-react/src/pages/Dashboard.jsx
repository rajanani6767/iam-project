import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const logout = async () => {
    // optional backend logout
    await fetch("https://iam-project.onrender.com/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    alert("Logged out 👋");
    navigate("/");
  };

  return (
    <div style={{
      background: "#0a0a0a",
      minHeight: "100vh",
      color: "white",
      textAlign: "center",
      paddingTop: "50px"
    }}>
      <h2>Dashboard 🔐</h2>

      <div style={{
        width: "300px",
        margin: "30px auto",
        padding: "20px",
        background: "#111",
        borderRadius: "15px"
      }}>
        <p>Welcome to secure area ✅</p>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}