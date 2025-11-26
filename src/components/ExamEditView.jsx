import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { updateExam } from '../api/examApi';

const ExamEditView = ({ exam, onBack, onSaveSuccess }) => {
  const [examInfo, setExamInfo] = useState({
    title: '',
    description: '',
    timeLimit: 60,
    startTime: '',
    endTime: '',
    maxAttempts: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (exam) {
      setExamInfo({
        title: exam.title,
        description: exam.note || '',
        timeLimit: exam.duration,
        startTime: exam.earliest_start_time ? new Date(exam.earliest_start_time).toISOString().slice(0, 16) : '',
        endTime: exam.lastest_start_time ? new Date(exam.lastest_start_time).toISOString().slice(0, 16) : '',
        maxAttempts: exam.max_attempt || 1,
      });
    }
  }, [exam]);

  const handleInputChange = (field, value) => {
    setExamInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (!examInfo.title.trim()) {
      toast.error('Vui lòng nhập tên đề thi');
      return;
    }

    if (!examInfo.startTime) {
      toast.error('Vui lòng chọn thời gian mở đề');
      return;
    }

    if (!examInfo.endTime) {
      toast.error('Vui lòng chọn thời gian đóng đề');
      return;
    }

    if (new Date(examInfo.startTime) >= new Date(examInfo.endTime)) {
      toast.error('Thời gian mở đề phải trước thời gian đóng đề');
      return;
    }

    try {
      setLoading(true);
      
      const examData = {
        title: examInfo.title.trim(),
        note: examInfo.description.trim() || '',
        duration: parseInt(examInfo.timeLimit),
        earliest_start_time: new Date(examInfo.startTime).toISOString(),
        lastest_start_time: examInfo.endTime ? new Date(examInfo.endTime).toISOString() : null,
        max_attempt: examInfo.maxAttempts || null,
        list_question: exam.list_question.map(q => ({
          question_id: q.id,
          score: Math.round(q.score_in_exam || q.score || 1)
        }))
      };

      const response = await updateExam(exam.id, examData);
      
      if (response.code === 'SUCCESS') {
        toast.success('Cập nhật đề thi thành công!');
        onSaveSuccess();
        onBack();
      }
    } catch (error) {
      console.error('Error updating exam:', error);
      let errorMessage = 'Có lỗi xảy ra khi cập nhật đề thi';
      
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        errorMessage = `Lỗi validation: ${validationErrors.map(e => e.message).join(', ')}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!exam) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6" style={{ minHeight: 'calc(100vh - 32px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Chỉnh sửa đề thi</h1>
          <p className="text-gray-600 text-sm">Cập nhật thông tin đề thi</p>
        </div>
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition font-medium"
        >
          ← Quay lại
        </button>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Thông tin cơ bản</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Tên đề thi <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={examInfo.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Nhập tên đề thi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Thời gian giới hạn (phút)</label>
              <input
                type="number"
                min="1"
                value={examInfo.timeLimit}
                onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Thời gian mở đề <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                value={examInfo.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Thời gian đóng đề <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                value={examInfo.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Số lượt thi tối đa</label>
              <input
                type="number"
                min="1"
                value={examInfo.maxAttempts}
                onChange={(e) => handleInputChange('maxAttempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">Mô tả đề thi (tùy chọn)</label>
            <textarea
              value={examInfo.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500 resize-none"
              placeholder="Nhập mô tả hoặc ghi chú cho đề thi"
            />
          </div>
        </div>

        {/* Questions Info */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-black mb-4">
            Danh sách câu hỏi ({exam.list_question?.length || 0} câu)
          </h3>
          <div className="text-sm text-gray-600 mb-4">
            <p>Tổng điểm: {exam.list_question?.reduce((total, q) => total + (q.score_in_exam || q.score || 0), 0) || 0} điểm</p>
            <p className="text-blue-600 mt-2">
              💡 Để thay đổi câu hỏi hoặc điểm số, vui lòng sử dụng trang "Tạo đề thi"
            </p>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {exam.list_question && exam.list_question.length > 0 ? (
              exam.list_question.map((question, index) => (
                <div key={question.id} className="bg-white rounded p-3 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          Câu {index + 1}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                          {question.score_in_exam || question.score || 0} điểm
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 line-clamp-2">{question.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Đề thi chưa có câu hỏi nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium shadow-md disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Cập nhật đề thi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamEditView;
