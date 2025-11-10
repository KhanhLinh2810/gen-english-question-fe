import { useState } from "react";
import axios from "axios";

const GenQuestion = ({ onCancel }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      alert("Vui lòng chọn một hình ảnh trước khi tạo câu hỏi!");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const res = await axios.post(
        "https://vigilant-passion-production-9ae2.up.railway.app/api/health?fbclid=IwY2xjawN39fRleHRuA2FlbQIxMABicmlkETFleVNaSG15VHI5cGk1bEZsc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHgzUM5kDW-LjIYCxFyXneXtDxi4dSUb_NqIAXECLfheR2uRd8gnqh9tFa8J2_aem_X1gzGftzhB4UUe1qb5gUCQ", // 🔗 Thay bằng link BE của bạn
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Kết quả từ server:", res.data);
      alert("Ảnh đã được gửi thành công!");
    } catch (error) {
      console.error("Lỗi khi gửi ảnh:", error);
      alert("Gửi ảnh thất bại, vui lòng thử lại!");
    }
  };

  return (
    <div className="p-6 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Sinh câu hỏi từ hình ảnh
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn ảnh từ máy tính
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-600
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              cursor-pointer"
          />
        </div>

        {previewUrl && (
          <div className="mt-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-64 object-contain rounded-2xl border shadow-sm"
            />
          </div>
        )}

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Tạo câu hỏi
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenQuestion;
