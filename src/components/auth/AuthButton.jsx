const AuthButton = ({ children, isLoading = false, type = "button", ...props }) => {
  return (
    <button
      type={type}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          Đang xử lý...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default AuthButton;
