import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import SidebarMenu from '../components/SidebarMenu';
import { getMe, updateProfile, updatePassword, deleteAccount } from '../api/userApi.js';
import { setUser, logout } from './redux/userSlice.js';

const Settings = () => {
  const user = useSelector(state => state.user.currentUser);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    old_password: '',
    new_password: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old_password: false,
    new_password: false,
    confirmPassword: false
  });

  // Load user info on component mount
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setLoading(true);
        const response = await getMe();
        console.log('User info response:', response); // Debug log
        if (response.code === 'SUCCESS' && response.data) {
          const userData = response.data;
          setUserInfo(userData);
          setFormData(prev => ({
            ...prev,
            username: userData.username || '',
            email: userData.email || ''
          }));
        }
      } catch (error) {
        console.error('Error loading user info:', error);
        toast.error('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      const response = await updateProfile({
        username: formData.username,
        email: formData.email
      });
      
      if (response.code === 'SUCCESS') {
        toast.success('Cập nhật thông tin thành công!');
        setUserInfo(response.data);
        // Update Redux store
        dispatch(setUser(response.data));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!formData.old_password || !formData.new_password || !formData.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin mật khẩu');
      return;
    }
    
    if (formData.new_password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (formData.new_password.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);
      const response = await updatePassword({
        old_password: formData.old_password,
        new_password: formData.new_password
      });
      
      if (response.code === 'SUCCESS') {
        toast.success('Đổi mật khẩu thành công!');
        setFormData(prev => ({
          ...prev,
          old_password: '',
          new_password: '',
          confirmPassword: ''
        }));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await deleteAccount();
      
      if (response.code === 'SUCCESS') {
        toast.success('Tài khoản đã được xóa thành công!');
        // Clear localStorage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        dispatch(logout());
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa tài khoản';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 bg-gray-100 min-h-screen p-4">
      {/* Sidebar */}
      <div className="w-96">
        <SidebarMenu />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-sm p-6" style={{minHeight: 'calc(100vh - 32px)'}}>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-black mb-1">Cài đặt</h1>
            </div>
          </div>

          {/* Settings Content */}
          {loading && !userInfo ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Đang tải thông tin...</div>
            </div>
          ) : (
          <div className="space-y-8">
            {/* Personal Information Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-black mb-4">Thông tin cá nhân</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Tên/Thay đổi
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
                      placeholder="Nhập tên của bạn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
                      placeholder="Nhập email của bạn"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>

            {/* Change Password Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-black mb-4">Thay đổi mật khẩu</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Mật khẩu cũ
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.old_password ? "text" : "password"}
                      name="old_password"
                      value={formData.old_password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('old_password')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.old_password ? (
                        <span className="text-lg">👁️</span>
                      ) : (
                        <span className="text-lg">🙈</span>
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new_password ? "text" : "password"}
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
                        placeholder="Nhập mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new_password')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.new_password ? (
                          <span className="text-lg">👁️</span>
                        ) : (
                          <span className="text-lg">🙈</span>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
                        placeholder="Xác nhận mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.confirmPassword ? (
                          <span className="text-lg">👁️</span>
                        ) : (
                          <span className="text-lg">🙈</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </button>
              </form>
            </div>

            {/* Delete Account Section */}
            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <h2 className="text-lg font-semibold text-red-900 mb-4">Xóa tài khoản</h2>
              <p className="text-sm text-red-800 mb-4">
                Hành động xóa tài khoản sẽ không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xóa...' : 'Xóa tài khoản'}
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
