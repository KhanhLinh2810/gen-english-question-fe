import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import logo from '../assets/logo.png';
import { logout } from '../pages/redux/userSlice.js';
import { jwtDecode } from 'jwt-decode'; // Thêm import jwtDecode

const Header = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [user, setUser] = useState(useSelector((state) => state.user.currentUser));
  const token = localStorage.getItem('token');
  useEffect(() => {
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
    }
  }, [token, dispatch]);

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setShowDropdown(false);
    setIsOpen(false);
    localStorage.removeItem('token'); // Xóa thông tin người dùng khỏi localStorage
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Chuyển hướng về trang đăng nhập
  };
  return (
    <header className="bg-zinc-300 fixed top-0 left-0 w-full z-50 py-1">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
          <span className="text-xl font-semibold text-[#8a3be5]" >GenQuestionAI</span>
        </Link>

        {/* Navigation links - nằm ngang, ẩn trên mobile */}
        <nav className="  md:flex space-x-5 text-gray-700 font-medium">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <Link to="/GenQuestion" className="hover:text-blue-600">Tạo câu hỏi</Link>
          <Link to="/CreateExam" className="hover:text-blue-600">Tạo đề thi</Link>
        </nav>

        {/* Hamburger */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
          <svg className="h-6 w-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4 relative">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}

                className="flex items-center space-x-2 focus:outline-none"
              >
                <span className="text-gray-700">{user.username}</span>
                <img src={user.avatar} alt="avatar" className="h-8 w-8 rounded-full" />
              </button>

              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="fixed top-0 right-0 bg-gray-100  shadow-lg p-4 w-48 z-50 h-screen overflow-auto"
                  style={{ height: '100vh' }}
                >

                  <div className="flex items-center space-x-3 mb-2 border-b border-gray-300 pb-2">
                    <img src={user.avatar} alt="avatar" className="h-8 w-8 rounded-full" />
                    <span>{user?.username}</span>
                  </div>
                  <Link to="/profile" className="block py-2 text-gray-700 hover:text-blue-600 border-b border-gray-300">Trang cá nhân</Link>
                  <Link to="/settings" className="block py-2 text-gray-700 hover:text-blue-600 border-b border-gray-300">Cài đặt</Link>
                  <button className="block w-full text-left py-2 text-red-600 hover:text-red-800 "
                    onClick={handleLogout}
                  >Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="block py-2 px-2 bg-white  text-gray-700 font-medium hover:bg-gray-700 rounded-lg transition">Đăng nhập</Link>
              <Link to="/register" className="block py-2 px-2 bg-white  text-gray-700 font-medium hover:bg-gray-700 rounded-lg transition ">Đăng ký</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden fixed top-0 right-0 bg-white shadow-lg p-4 w-48 z-50 h-screen overflow-auto"
          style={{ height: '100vh' }}
        >
          {user ? (
            <>
              <div className="flex items-center space-x-3 mb-2">
                <img src={user.avatar} alt="avatar" className="h-8 w-8 rounded-full" />
                <span>{user?.username}</span>
              </div>
              <Link to="/profile" className="block py-2 text-gray-700 hover:text-blue-600">Trang cá nhân</Link>
              <Link to="/settings" className="block py-2 text-gray-700 hover:text-blue-600">Cài đặt</Link>
              <button className="block w-full text-left py-2 text-red-600 hover:text-red-800"
                onClick={handleLogout}
              >Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsOpen(false)}>Đăng nhập</Link>
              <Link to="/register" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsOpen(false)}>Đăng ký</Link>
            </>
          )}
          <br />
          <nav className="flex flex-col mb-3">
            <Link to="/" className="block text-gray-700 hover:text-blue-600 py-2 border-b border-gray-300" onClick={() => setIsOpen(false)}>Trang chủ</Link>
            <Link to="/books" className="block text-gray-700 hover:text-blue-600 py-2 border-b border-gray-300" onClick={() => setIsOpen(false)}>Tìm kiếm</Link>
            {user && (
              <Link
                to="/my-reserving"
                className="block text-gray-700 hover:text-blue-600 py-2 border-b border-gray-300"
                onClick={() => setIsOpen(false)}
              >
                Sách đã đặt
              </Link>
            )}

            {user?.role === 'Admin' && (
              <Link
                to="/manage"
                className="block text-gray-700 hover:text-blue-600 py-2 border-b border-gray-300"
                onClick={() => setIsOpen(false)}
              >
                Quản lý
              </Link>
            )}
            <Link to="/contact" className="block text-gray-700 hover:text-blue-600 py-2 border-b border-gray-300" onClick={() => setIsOpen(false)}>Liên hệ</Link>
          </nav>

        </div>
      )}
    </header>
  );
};

export default Header;
