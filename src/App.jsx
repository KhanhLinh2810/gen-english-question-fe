import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout, setUser } from "./pages/redux/userSlice.js";
import { jwtDecode } from "jwt-decode";

import HomePage from "./pages/HomePage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import GenQuestion from "./pages/GenQuestion.jsx";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import CreateExam from "./pages/CreateExam.jsx";
export default function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ Kiểm tra token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.clear();
        dispatch(logout());
      } else {
        dispatch(setUser(decoded));
      }
    }
  }, [dispatch]);

  // Ẩn layout ở trang login/register
  const noLayoutRoutes = ["/login", "/register"];
  const hideLayout = noLayoutRoutes.includes(location.pathname);

  // Sidebar controls
  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-white ">
      {!hideLayout && <Header onCreateQuestionClick={openSidebar} />}

      <main className={!hideLayout ? "pt-16" : ""} >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/GenQuestion" element={<GenQuestion />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/CreateExam" element={<CreateExam/>}/>
        </Routes>
      </main>

      {/* Sidebar hiển thị GenQuestion */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} title="Tạo câu hỏi">
        <GenQuestion onCancel={closeSidebar} />
      </Sidebar>
    </div>
  );
}
