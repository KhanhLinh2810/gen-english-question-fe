import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/apiCaller.js'; // Hàm gọi API đăng ký

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigator = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setError('Email không hợp lệ');
            return;
        }
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        if (username.length < 3) {
            setError('Tên đăng nhập phải có ít nhất 3 ký tự');
            return;
        }
        if (username.length > 20) {
            setError('Tên đăng nhập không được quá 20 ký tự');
            return;
        }

        // const avatar = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'; // Đặt avatar mặc định
        try {
            const newUser = { username, email, password };
            await register(newUser); // Gọi API để đăng ký người dùng mới
            console.log('Đăng kí thành công')
            setError('');
            navigator('/login'); // Chuyển hướng sang trang đăng nhập sau khi đăng ký thành công
        } catch (error) {
            console.error('Đăng ký thất bại:', error);
            setSuccess('');
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else if (error.message) {
                setError(error.message); // Lấy lỗi message từ throw new Error()
            } else {
                setError('Đăng ký thất bại, vui lòng thử lại.');
            }
        }
    };

    return (
        <div className="relative flex flex-col h-screen bg-white md:flex-row">
            {/* Cột hình ảnh */}
            <div className="hidden md:block w-3/5">
                <img
                    src="src/assets/bia.png"
                    alt="Login"
                    className="object-cover w-full h-full"
                />
            </div>

            {/* Cột form */}
            <div className="absolute md:relative top-[40%] md:top-0 flex items-center justify-center w-full md:w-2/5 bg-white">
                <div className="w-full max-w-[500px] md:w-3/4 md:h-max">
                    <div className="h-full px-4 sm:px-0">
                        <form onSubmit={handleSubmit} className="flex flex-col p-4 gap-4">
                            <h2 className="text-2xl font-semibold text-center sm:text-left mb-4">
                                Đăng ký
                            </h2>

                            {/* Tài khoản */}
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="username"
                                    className="text-[1rem] font-medium text-gray-700"
                                >
                                    Tài khoản đăng nhập
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Nhập tài khoản đăng nhập của bạn"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="email"
                                    className="text-[1rem] font-medium text-gray-700"
                                >
                                    Email
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Nhập email của bạn"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Mật khẩu */}
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="password"
                                    className="text-[1rem] font-medium text-gray-700"
                                >
                                    Mật khẩu
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Nhập mật khẩu của bạn"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            {/*Xác nhận mật khẩu */}
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="confirmPassword"
                                    className="text-[1rem] font-medium text-gray-700"
                                >
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Nhập lại mật khẩu của bạn"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            {/* Hiển thị lỗi */}
                            {error && (
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            )}
                            {/* Hiển thị thành công */}
                            {success && <p className="text-green-500 text-sm text-center">{success}</p>}

                            {/* Nút đăng nhập */}
                            <button
                                type="submit"
                                className="bg-linear-to-r from-purple-500 to-indigo-500 text-white py-2 rounded-md hover:opacity-90 transition"
                            >
                                Đăng ký
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
