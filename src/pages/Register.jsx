import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/apiCaller.js';
import { toast } from 'react-toastify';
import { AuthLayout, InputField, AuthButton, AuthLink } from '../components/auth';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        password: false,
        confirmPassword: false
    });
    const navigator = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = 'Vui lòng nhập tài khoản';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Tài khoản phải có ít nhất 3 ký tự';
        } else if (formData.username.length > 20) {
            newErrors.username = 'Tài khoản không được quá 20 ký tự';
        }

        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!emailPattern.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        // Password validation
        if (!formData.password.trim()) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        // Confirm password validation
        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
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
            const newUser = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            };
            await register(newUser);
            toast.success('Đăng ký thành công! Vui lòng đăng nhập');
            navigator('/login');
        } catch (error) {
            console.error('Đăng ký thất bại:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.message) {
                toast.error(error.message);
            } else {
                toast.error('Đăng ký thất bại, vui lòng thử lại');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Đăng ký">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
                <InputField
                    label="Tài khoản đăng nhập"
                    id="username"
                    type="text"
                    placeholder="Nhập tài khoản đăng nhập"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    error={errors.username}
                />

                <InputField
                    label="Email"
                    id="email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                />

                <div className="relative">
                    <InputField
                        label="Mật khẩu"
                        id="password"
                        type={showPasswords.password ? "text" : "password"}
                        placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                    />
                    <button
                        type="button"
                        onClick={() => togglePasswordVisibility('password')}
                        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                    >
                        {showPasswords.password ? (
                            <span className="text-lg">👁️</span>
                        ) : (
                            <span className="text-lg">🙈</span>
                        )}
                    </button>
                </div>

                <div className="relative">
                    <InputField
                        label="Xác nhận mật khẩu"
                        id="confirmPassword"
                        type={showPasswords.confirmPassword ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                    />
                    <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                        className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                    >
                        {showPasswords.confirmPassword ? (
                            <span className="text-lg">👁️</span>
                        ) : (
                            <span className="text-lg">🙈</span>
                        )}
                    </button>
                </div>

                <AuthButton type="submit" isLoading={isLoading}>
                    Đăng ký
                </AuthButton>

                <AuthLink
                    text="Đã có tài khoản?"
                    linkText="Đăng nhập ngay"
                    to="/login"
                />
            </form>
        </AuthLayout>
    );
};

export default Register;
