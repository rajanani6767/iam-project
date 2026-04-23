import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const BASE_URL = "https://iam-project.onrender.com";

export default function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/auth/dashboard`, {
      credentials: "include",   // 🔥 IMPORTANT
    })
      .then((res) => {
        if (res.ok) setIsAuth(true);
        else setIsAuth(false);
      })
      .catch(() => setIsAuth(false));
  }, []);

  if (isAuth === null) return <h3>Loading...</h3>;

  return isAuth ? children : <Navigate to="/" />;
}