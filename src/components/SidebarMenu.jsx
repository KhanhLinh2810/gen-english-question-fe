import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { getMe } from '../api/userApi';
import logo from '../assets/logo.png';

const SidebarMenu = () => {
  const location = useLocation();
  const user = useSelector(state => state.user.currentUser);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const response = await getMe();
        if (response.code === 'SUCCESS' && response.data) {
          setUserInfo(response.data);
        }
      } catch (error) {
        // Silently fail, use Redux user as fallback
      }
    };

    if (user) {
      loadUserInfo();
    }
  }, [user]);

  const menuItems = [
    { label: 'Trang chủ', icon: '🏠', path: '/' },
    { label: 'Tạo đề thi', icon: '📝', path: '/CreateExam' },
    { label: 'Tạo câu hỏi thủ công', icon: '✏️', path: '/manual-questions' },
    { label: 'Ngân hàng câu hỏi', icon: '📚', path: '/questions' },
    { label: 'Ngân hàng đề thi', icon: '📋', path: '/exam-bank' },
    { label: 'Lịch sử làm bài', icon: '⏱️', path: '/history' },
    { label: 'Cài đặt', icon: '⚙️', path: '/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="w-96 bg-gradient-to-b from-slate-800 via-slate-900 to-blue-900 text-white p-6 rounded-2xl flex flex-col" style={{minHeight: 'calc(100vh - 32px)'}}>
      {/* Logo & Title */}
      <div className="text-center mb-6">
        <img src={logo} alt="Logo" className="w-10 h-10 rounded mx-auto mb-2" />
        <h1 className="text-lg font-bold">eQuiz</h1>
        <span className="text-xs text-blue-300">Khởi nguồn tri thức</span>
      </div>

      {/* User Info Card */}
      <div className="bg-white/10 rounded-lg p-4 mb-6 text-center">
        <img
          src={userInfo?.avatar_url || user?.avatar || 'https://via.placeholder.com/60'}
          alt="Avatar"
          className="w-14 h-14 rounded-full border-2 border-white mx-auto mb-3"
        />
        <p className="font-semibold text-sm">
          Xin chào, {userInfo?.username || user?.username || 'Người dùng'}
        </p>
      </div>

      {/* Menu Items */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition text-sm ${
              location.pathname === item.path
                ? 'bg-white text-slate-900 font-semibold shadow-md'
                : 'bg-white/90 text-slate-800 hover:bg-white hover:shadow-sm'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg transition text-sm bg-red-500 text-white hover:bg-red-600 shadow-md"
        >
          <span className="text-lg">🚪</span>
          <span className="font-medium">Đăng xuất</span>
        </button>
      </nav>
    </div>
  );
};

export default SidebarMenu;
