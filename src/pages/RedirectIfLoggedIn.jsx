import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function RedirectIfLoggedIn({ children }) {
  const token = Cookies.get("access_token");

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
