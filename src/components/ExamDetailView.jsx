import React from 'react';

const ExamDetailView = ({ exam, onBack }) => {
  if (!exam) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Không giới hạn';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    const displayHours = date.getHours() % 12 || 12;
    return `${day}/${month}/${year}, ${displayHours}:${minutes} ${ampm}`;
  };


  return (
    <div className="bg-white rounded-2xl shadow-sm p-6" style={{ minHeight: 'calc(100vh - 32px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Chi tiết đề thi</h1>
          <p className="text-gray-600 text-sm">Xem thông tin chi tiết đề thi</p>
        </div>
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition font-medium"
        >
          ← Quay lại
        </button>
      </div>

      {/* Exam Title */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white mb-6">
        <h2 className="text-2xl font-bold mb-2">{exam.title}</h2>
      </div>

      {/* Exam Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">👤</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Người tạo đề thi:</p>
              <p className="font-semibold text-gray-800">{exam.creator?.username || 'Hệ thống'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">📝</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Số lượng câu hỏi:</p>
              <p className="font-semibold text-gray-800">{exam.list_question?.length || exam.total_question || 0} câu</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-xl">⏰</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Thời gian thi:</p>
              <p className="font-semibold text-gray-800">{exam.duration} phút</p>
            </div>
          </div>
        </div>
      </div>

      {/* Time and Limit Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Thời gian và Giới hạn</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">●</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Bắt đầu sớm nhất:</p>
              <p className="font-medium text-gray-800">{formatDate(exam.earliest_start_time)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm">●</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Bắt đầu muộn nhất:</p>
              <p className="font-medium text-gray-800">{formatDate(exam.lastest_start_time)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">👥</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Giới hạn thí sinh:</p>
              <p className="font-medium text-gray-800">{exam.max_attempt ? `${exam.max_attempt} lượt` : 'Không giới hạn'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Note from creator - Warning box */}
      {exam.note && (
        <div className="mb-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-yellow-600 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                  CHÚ THÍCH TỪ NGƯỜI TẠO ĐỀ:
                </h3>
                <p className="text-sm text-yellow-700">{exam.note}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creator Info */}
      {exam.creator && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <img
              src={exam.creator.avatar_url || 'https://via.placeholder.com/32'}
              alt="Creator Avatar"
              className="w-8 h-8 rounded-full"
            />
            <div>
              <span className="font-medium">Tạo bởi: {exam.creator.username}</span>
              <span className="mx-2">•</span>
              <span>{new Date(exam.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Start Exam Button */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
        <button
          onClick={() => {
            // Navigate to take exam page
            window.location.href = `/take-exam?exam_id=${exam.id}`;
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transition flex items-center gap-2"
        >
          <span>🚀</span>
          <span>Bắt đầu làm bài</span>
        </button>
      </div>
    </div>
  );
};

export default ExamDetailView;
