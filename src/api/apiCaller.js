// src/api/apiCaller.js
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"; // sửa theo URL backend của bạn

// Tạo axios instance
export const apiCaller = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm token vào header
apiCaller.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response và error
apiCaller.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalid hoặc đã hết hạn
      Cookies.remove("access_token");

      // Điều hướng về /login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Hàm login
export const login = async (username, password) => {
  try {
    const response = await apiCaller.post("/auth/login", {
      username,
      password,
    });

    return response.data; // trả về dữ liệu JSON từ backend
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    throw error.response?.data || { message: "Lỗi kết nối server" };
  }
};

// Hàm register
// register nhận object hoặc các tham số rời
export const register = async (payload) => {
  try {
    const body =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? payload
        : {
            username: arguments[0],
            password: arguments[1],
            email: arguments[2],
          };

    const response = await apiCaller.post("/auth/register", body);
    return response.data;
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    throw error.response?.data || { message: "Lỗi kết nối server" };
  }
};

export const logOut = async () => {
  try {
    const response = await apiCaller.post("/auth/logout");
    if (response.status === 200)
    Cookies.remove("access_token");
    return response.data;
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
    throw error.response?.data || { message: "Lỗi kết nối server" };
  }
};
