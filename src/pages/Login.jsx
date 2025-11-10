import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { login } from "../api/apiCaller.js";
import { setUser } from "../pages/redux/userSlice.js";
import { toast } from "react-toastify";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState('');
  const navigator = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Vui lòng nhập đầy đủ tài khoản và mật khẩu!");
      return;
    }

    try {
      const data = await login(username, password);

      // ✅ Lưu token vào localStorage
      localStorage.setItem("token", data.token.accessToken);
      localStorage.setItem("refreshToken", data.token.refreshToken);

      // ✅ Giải mã token để lấy thông tin user
      const decodedUser = jwtDecode(data.token.accessToken);

      // ✅ Cập nhật user vào Redux
      dispatch(setUser(decodedUser));

      toast.success("Đăng nhập thành công!");
      console.log("User:", decodedUser);

      // ✅ Điều hướng
      navigator("/");
    } catch (err) {
      console.error("Đăng nhập thất bại:", err);
      setSuccess('');
      toast.error("Sai tài khoản hoặc mật khẩu!");
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
                Đăng nhập
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
                  placeholder="Nhập tài khoản hoặc email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                <div className="text-right mt-1">
                  <Link
                    to="/forgot-password"
                    className="text-indigo-600 hover:underline text-sm"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              {/* Nút đăng nhập */}
              <button
                type="submit"
                className="bg-linear-to-r from-purple-500 to-indigo-500 text-white py-2 rounded-md hover:opacity-90 transition"
              >
                Đăng nhập
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
