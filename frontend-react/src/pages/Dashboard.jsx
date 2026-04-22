import { useNavigate } from "react-router-dom";

const BASE_URL = "https://iam-project.onrender.com";

export default function Dashboard() {
  const navigate = useNavigate();

  const loadData = async () => {
    const res = await fetch(`${BASE_URL}/auth/dashboard`, {
      credentials: "include",
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message);
    } else {
      alert("Unauthorized ❌");
      navigate("/");
    }
  };

  const logout = async () => {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    alert("Logged out");
    navigate("/");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Dashboard 🔐</h2>

      <button onClick={loadData}>Check Access</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}