import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { login } from "../api/apiCaller.js";
import { setUser } from "../pages/redux/userSlice.js";
import { toast } from "react-toastify";
import { AuthLayout, InputField, AuthButton, AuthLink } from "../components/auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigator = useNavigate();
  const dispatch = useDispatch();

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Vui lòng nhập tài khoản";
    if (!password.trim()) newErrors.password = "Vui lòng nhập mật khẩu";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const data = await login(username, password);

      // backend trả về cấu trúc: { code, message, data: { access_token } }
      // hoặc một số endpoint trả về { token: { accessToken, refreshToken } }
      const accessToken =
        data?.token?.accessToken || data?.data?.access_token || data?.access_token;

      if (!accessToken) {
        throw new Error('Token không hợp lệ');
      }

      // ✅ Lưu token vào localStorage
      localStorage.setItem("token", accessToken);

      // Nếu có refresh token, lưu luôn
      if (data?.token?.refreshToken) {
        localStorage.setItem('refreshToken', data.token.refreshToken);
      }

      // ✅ Giải mã token để lấy thông tin user
      const decodedUser = jwtDecode(accessToken);

      // ✅ Cập nhật user vào Redux
      dispatch(setUser(decodedUser));

      toast.success("Đăng nhập thành công!");
      console.log("User:", decodedUser);

      // ✅ Điều hướng
      navigator("/");
    } catch (err) {
      console.error("Đăng nhập thất bại:", err);
      toast.error("Sai tài khoản hoặc mật khẩu!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng nhập">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
        <InputField
          label="Tài khoản đăng nhập"
          id="username"
          type="text"
          placeholder="Nhập tài khoản hoặc email"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (errors.username) {
              setErrors({ ...errors, username: "" });
            }
          }}
          error={errors.username}
        />

        <div>
          <div className="relative">
            <InputField
              label="Mật khẩu"
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors({ ...errors, password: "" });
                }
              }}
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <span className="text-lg">👁️</span>
              ) : (
                <span className="text-lg">🙈</span>
              )}
            </button>
          </div>
          <div className="text-right mt-3">
            <Link
              to="/forgot-password"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        <AuthButton type="submit" isLoading={isLoading}>
          Đăng nhập
        </AuthButton>

        <AuthLink
          text="Chưa có tài khoản?"
          linkText="Đăng ký ngay"
          to="/register"
        />
      </form>
    </AuthLayout>
  );
};

export default Login;
