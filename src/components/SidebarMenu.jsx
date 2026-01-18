import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import logo from "../assets/logo.png";
import { logOut } from "../api/apiCaller";
import { toast } from "react-toastify";
import { getMe } from "../api/userApi.js";
import { useEffect, useState } from "react";
import { setUser } from "../pages/redux/userSlice.js";
import {
  HomeIcon,
  PencilSquareIcon,
  PencilIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import Cookies from "js-cookie";

const SidebarMenu = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.user.currentUser);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const response = await getMe();
        if (response.code === "SUCCESS" && response.data) {
          setUserInfo(response.data);

          dispatch(setUser(response.data));
        }
      } catch (error) {
        console.warn("Không lấy được thông tin user");
      }
    };

    loadUserInfo();
  }, []);

  const menuItems = [
    {
      label: "Trang chủ",
      icon: HomeIcon,
      path: "/",
    },
    {
      label: "Tạo đề thi",
      icon: PencilSquareIcon,
      path: "/CreateExam",
    },
    {
      label: "Tạo câu hỏi tự động",
      icon: PencilIcon,
      path: "/gen-questions",
    },
    {
      label: "Tạo câu hỏi thủ công",
      icon: PencilIcon,
      path: "/manual-questions",
    },
    {
      label: "Ngân hàng câu hỏi",
      icon: BookOpenIcon,
      path: "/questions",
    },
    {
      label: "Ngân hàng đề thi",
      icon: ClipboardDocumentListIcon,
      path: "/exam-bank",
    },
    // {
    //   label: "Lịch sử làm bài",
    //   icon: ClockIcon,
    //   path: "/history",
    // },
    {
      label: "Cài đặt",
      icon: Cog6ToothIcon,
      path: "/settings",
    },
  ];

  const handleLogout = () => {
    try {
      logOut();
      Cookies.remove("access_token", { path: "/" });
      toast.success("Đăng xuất thành công");
      setTimeout(() => {
        window.location.href = "/login";
      }, 700);
    } catch (error) {
      toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div
      className="w-80 self-start sticky top-4 bg-[#2D3E83] text-white p-6 rounded-lg flex flex-col shadow-xl overflow-auto"
      style={{ height: "calc(100vh - 32px)" }}
    >
      {/* Logo & Title */}
      <div className="text-center mb-8">
        <img src={logo} alt="Logo" className="w-10 h-10 rounded mx-auto mb-2" />
        <h1 className="text-lg font-semibold tracking-wide">eQuiz</h1>
        <span className="text-xs text-slate-400">Khởi nguồn tri thức</span>
      </div>

      {/* User Info Card */}
      <div className="bg-white/5 backdrop-blur rounded-xl p-4 mb-6 text-center">
        <img
          src={userInfo?.avatar_url || "../../src/assets/default-avatar.png"}
          alt="Avatar"
          className="w-14 h-14 rounded-full border border-white/20 mx-auto mb-3"
        />
        <p className="font-medium text-sm text-slate-200">
          Xin chào, {userInfo?.username || user?.username || "Người dùng"}
        </p>
      </div>

      {/* Menu Items */}
      <nav className="space-y-1 flex-1">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={idx}
              to={item.path}
              className={`
          group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition
          ${
            isActive
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }
        `}
            >
              <Icon
                className={`
            w-5 h-5 transition
            ${
              isActive
                ? "text-slate-900"
                : "text-slate-400 group-hover:text-white"
            }
          `}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="pt-4 mt-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="
      w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm
      text-red-400 hover:text-white
      hover:bg-red-500/10 transition
    "
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarMenu;
