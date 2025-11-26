import React from 'react';

const ExamDetailModal = ({ isOpen, onClose, exam }) => {
  if (!isOpen || !exam) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không giới hạn';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const questionTypes = {
    1: 'Khác',
    2: 'Từ vựng'
  };

  return (
    <div 
      className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden transform transition-all duration-200 scale-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{exam.title}</h2>
              <p className="text-blue-100 text-sm mt-1">Chi tiết đề thi</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-blue-200 transition text-3xl leading-none"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Exam Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin chung</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-medium text-gray-800">{exam.duration} phút</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số câu hỏi:</span>
                  <span className="font-medium text-gray-800">{exam.list_question?.length || 0} câu</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lượt thi tối đa:</span>
                  <span className="font-medium text-gray-800">{exam.max_attempt || 'Không giới hạn'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng điểm:</span>
                  <span className="font-medium text-gray-800">
                    {exam.list_question?.reduce((total, q) => total + (q.score_in_exam || q.score || 0), 0) || 0} điểm
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Thời gian thi</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Mở đề:</span>
                  <p className="font-medium text-gray-800">{formatDate(exam.earliest_start_time)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Đóng đề:</span>
                  <p className="font-medium text-gray-800">{formatDate(exam.lastest_start_time)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {exam.note && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Mô tả</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{exam.note}</p>
              </div>
            </div>
          )}

          {/* Questions List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Danh sách câu hỏi ({exam.list_question?.length || 0} câu)
            </h3>
            <div className="space-y-4">
              {exam.list_question && exam.list_question.length > 0 ? (
                exam.list_question.map((question, index) => (
                  <div key={question.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          Câu {index + 1}
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                          {questionTypes[question.type] || 'Khác'}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">
                          {question.score_in_exam || question.score || 0} điểm
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-800 mb-2">{question.content}</h4>
                    
                    {question.description && (
                      <p className="text-gray-600 text-sm mb-3 italic">{question.description}</p>
                    )}

                    {/* Choices */}
                    {question.choices && question.choices.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Các lựa chọn:</p>
                        <div className="grid grid-cols-1 gap-2">
                          {question.choices.map((choice, choiceIndex) => (
                            <div
                              key={choice.id}
                              className={`p-2 rounded text-sm border ${
                                choice.is_correct
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : 'bg-white border-gray-200 text-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {choice.is_correct && <span className="text-green-600 font-bold">✓</span>}
                                <span className="font-medium">{String.fromCharCode(65 + choiceIndex)}.</span>
                                <span>{choice.content}</span>
                              </div>
                              {choice.explanation && (
                                <div className="text-xs text-gray-600 italic ml-6 mt-1">
                                  Giải thích: {choice.explanation}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Đề thi chưa có câu hỏi nào</p>
                </div>
              )}
            </div>
          </div>

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
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamDetailModal;
