import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { updateQuestion } from '../api/questionApi.js';

const questionTypes = [
  { value: 1, label: 'Khác' },
  { value: 2, label: 'Từ vựng' }
];

const EditQuestionModal = ({ isOpen, onClose, question, onSuccess }) => {
  const [formData, setFormData] = useState({
    content: '',
    description: '',
    score: 1,
    type: 1,
    tags: '',
    choices: []
  });
  const [loading, setLoading] = useState(false);

  // Initialize form data when question changes
  useEffect(() => {
    if (question && isOpen) {
      setFormData({
        content: question.content || '',
        description: question.description || '',
        score: question.score || 1,
        type: question.type || 1,
        tags: question.tags || '',
        choices: question.choices?.map(choice => ({
          id: choice.id,
          content: choice.content || '',
          is_correct: choice.is_correct || false,
          explanation: choice.explanation || ''
        })) || []
      });
    }
  }, [question, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChoiceChange = (choiceIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      choices: prev.choices.map((choice, index) => {
        if (index === choiceIndex) {
          if (field === 'is_correct' && value) {
            // Only one correct answer allowed
            return { ...choice, [field]: value };
          } else if (field === 'is_correct' && !value) {
            return { ...choice, [field]: value };
          }
          return { ...choice, [field]: value };
        } else if (field === 'is_correct' && value) {
          // Unset other choices when one is selected as correct
          return { ...choice, is_correct: false };
        }
        return choice;
      })
    }));
  };

  const validateForm = () => {
    if (!formData.content.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi');
      return false;
    }

    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả câu hỏi');
      return false;
    }

    if (formData.score < 0 || formData.score > 5) {
      toast.error('Điểm phải từ 0 đến 5');
      return false;
    }

    if (formData.choices.length < 2) {
      toast.error('Câu hỏi phải có ít nhất 2 lựa chọn');
      return false;
    }

    if (formData.choices.some(choice => !choice.content.trim())) {
      toast.error('Tất cả lựa chọn phải có nội dung');
      return false;
    }

    if (!formData.choices.some(choice => choice.is_correct)) {
      toast.error('Phải có ít nhất một đáp án đúng');
      return false;
    }

    // Giải thích không bắt buộc, bỏ validation này

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const updateData = {
        content: formData.content,
        description: formData.description,
        score: formData.score,
        type: formData.type,
        tags: formData.tags || '',
        by_ai: false,
        choices: formData.choices.map(choice => ({
          id: choice.id || null,
          content: choice.content,
          is_correct: choice.is_correct,
          explanation: choice.explanation
        }))
      };

      const response = await updateQuestion(question.id, updateData);
      
      if (response.code === 'SUCCESS') {
        toast.success('Cập nhật câu hỏi thành công!');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error updating question:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật câu hỏi';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black">Chỉnh sửa câu hỏi</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <span className="text-2xl text-gray-500">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Question Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Điểm</label>
              <input
                type="number"
                min="0"
                max="5"
                value={formData.score}
                onChange={(e) => handleInputChange('score', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Kiểu câu hỏi</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
              >
                {questionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Content */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-black mb-2">Câu hỏi</label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500 min-h-[80px]"
              placeholder="Nhập nội dung câu hỏi"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-black mb-2">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500 min-h-[60px]"
              placeholder="Nhập mô tả cho câu hỏi"
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-black mb-2">Tags (không bắt buộc)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
              placeholder="Nhập tags, phân cách bằng dấu phẩy (ví dụ: grammar, vocabulary, beginner)"
            />
          </div>

          {/* Choices */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-4">Các lựa chọn</h3>
            <div className="space-y-4">
              {formData.choices.map((choice, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="correct_choice"
                      checked={choice.is_correct}
                      onChange={(e) => handleChoiceChange(index, 'is_correct', e.target.checked)}
                      className="mt-2 form-radio h-4 w-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-black mb-1">
                          Lựa chọn {String.fromCharCode(65 + index)}
                        </label>
                        <input
                          type="text"
                          value={choice.content}
                          onChange={(e) => handleChoiceChange(index, 'content', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
                          placeholder={`Nhập nội dung lựa chọn ${String.fromCharCode(65 + index)}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Giải thích
                        </label>
                        <textarea
                          value={choice.explanation}
                          onChange={(e) => handleChoiceChange(index, 'explanation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500 text-sm min-h-[60px]"
                          placeholder="Nhập giải thích cho lựa chọn này"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium shadow-md"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuestionModal;
