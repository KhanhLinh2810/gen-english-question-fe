// src/api/apiCaller.js
import axios from "axios";

const API_BASE_URL = "https://vigilant-passion-production-9ae2.up.railway.app/api/health?fbclid=IwY2xjawN39fRleHRuA2FlbQIxMABicmlkETFleVNaSG15VHI5cGk1bEZsc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHgzUM5kDW-LjIYCxFyXneXtDxi4dSUb_NqIAXECLfheR2uRd8gnqh9tFa8J2_aem_X1gzGftzhB4UUe1qb5gUCQ"; // ✅ sửa theo URL backend của bạn

// Hàm login
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
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
export const register = async (username, password, email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      username,
      password,
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    throw error.response?.data || { message: "Lỗi kết nối server" };
  }
};
