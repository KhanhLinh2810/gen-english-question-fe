import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout, setUser } from "./pages/redux/userSlice.js";
import { jwtDecode } from "jwt-decode";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import HomePage from "./pages/HomePage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import GenQuestion from "./pages/GenQuestion.jsx";
import CreateExam from "./pages/CreateExam.jsx";
import Settings from "./pages/Settings.jsx";
import ManualQuestions from "./pages/ManualQuestions.jsx";
import QuestionsBank from "./pages/QuestionsBank.jsx";
import ExamBank from "./pages/ExamBank.jsx";
export default function App() {
  const dispatch = useDispatch();
  const location = useLocation();

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

  // Sidebar modal removed; homepage uses permanent sidebar menu

  return (
    <div className="min-h-screen bg-gray-100">
      <main className={!hideLayout ? "" : "min-h-screen w-full"} >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/GenQuestion" element={<GenQuestion />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/CreateExam" element={<CreateExam/>}/>
          <Route path="/settings" element={<Settings/>}/>
          <Route path="/manual-questions" element={<ManualQuestions/>}/>
          <Route path="/questions" element={<QuestionsBank/>}/>
          <Route path="/exam-bank" element={<ExamBank/>}/>
        </Routes>
      </main>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
