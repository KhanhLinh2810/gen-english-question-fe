import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { updateQuestion } from '../api/questionApi';

const questionTypes = [
  { value: 1, label: 'Khác' },
  { value: 2, label: 'Từ vựng' }
];

const choiceCountOptions = [
  { value: 2, label: '2 lựa chọn' },
  { value: 3, label: '3 lựa chọn' },
  { value: 4, label: '4 lựa chọn' },
  { value: 5, label: '5 lựa chọn' },
];

const EditQuestionView = ({ question, onBack, onSaveSuccess }) => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showExplanations, setShowExplanations] = useState({});

  useEffect(() => {
    if (question) {
      setFormData({
        id: question.id,
        question: question.content,
        description: question.description || '',
        points: question.score,
        type: question.type,
        tags: question.tags || '',
        choices: question.choices.map(choice => ({
          id: choice.id,
          text: choice.content,
          isCorrect: choice.is_correct,
          explanation: choice.explanation || ''
        }))
      });
      // Initialize showExplanations based on existing explanations
      const initialExplanations = {};
      question.choices.forEach(choice => {
        if (choice.explanation) {
          initialExplanations[`${question.id}-${choice.id}`] = true;
        }
      });
      setShowExplanations(initialExplanations);
    } else {
      setFormData(null);
      setShowExplanations({});
    }
  }, [question]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateChoice = useCallback((choiceId, field, value) => {
    setFormData(prev => {
      const updatedChoices = prev.choices.map(choice => {
        if (choice.id === choiceId) {
          if (field === 'isCorrect' && value) {
            return { ...choice, [field]: value };
          } else if (field === 'isCorrect' && !value) {
            return { ...choice, [field]: value };
          }
          return { ...choice, [field]: value };
        } else if (field === 'isCorrect' && value) {
          return { ...choice, isCorrect: false };
        }
        return choice;
      });
      return { ...prev, choices: updatedChoices };
    });
  }, []);

  const updateChoiceCount = (newCount) => {
    setFormData(prev => {
      const currentChoices = prev.choices;
      let newChoices = [...currentChoices];

      if (newCount > currentChoices.length) {
        for (let i = currentChoices.length + 1; i <= newCount; i++) {
          newChoices.push({
            id: Date.now() + i, // Unique ID for new choices
            text: '',
            isCorrect: false,
            explanation: ''
          });
        }
      } else if (newCount < currentChoices.length) {
        newChoices = newChoices.slice(0, newCount);
      }
      return { ...prev, choices: newChoices };
    });
  };

  const toggleExplanation = (choiceId) => {
    const key = `${formData.id}-${choiceId}`;
    setShowExplanations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    if (!formData.question.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả cho câu hỏi');
      return;
    }
    if (formData.points < 0 || formData.points > 5) {
      toast.error('Điểm cho câu hỏi phải từ 0 đến 5');
      return;
    }
    if (formData.choices.some(choice => !choice.text.trim())) {
      toast.error('Tất cả lựa chọn phải được điền');
      return;
    }
    if (formData.choices.filter(choice => choice.isCorrect).length === 0) {
      toast.error('Câu hỏi phải có ít nhất một đáp án đúng');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        content: formData.question,
        description: formData.description,
        score: formData.points,
        type: formData.type,
        tags: formData.tags || '',
        by_ai: false, // Assuming manual edit
        choices: formData.choices.map(choice => ({
          id: choice.id, // Include ID for update
          content: choice.text,
          is_correct: choice.isCorrect,
          explanation: choice.explanation || ''
        }))
      };
      const response = await updateQuestion(formData.id, payload);
      if (response.code === 'SUCCESS') {
        toast.success('Cập nhật câu hỏi thành công!');
        onSaveSuccess();
        onBack();
      } else {
        toast.error(response.message || 'Cập nhật câu hỏi thất bại.');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật câu hỏi.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6" style={{ minHeight: 'calc(100vh - 32px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black mb-1">Chỉnh sửa câu hỏi</h1>
          <p className="text-gray-600 text-sm">Cập nhật thông tin câu hỏi</p>
        </div>
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition font-medium"
        >
          ← Quay lại
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-black mb-2">Điểm</label>
            <input
              type="number"
              name="points"
              min="0"
              max="5"
              value={formData.points}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-black mb-2">Kiểu câu hỏi</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
            >
              {questionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-black mb-2">Số lượng lựa chọn</label>
            <select
              value={formData.choices.length}
              onChange={(e) => updateChoiceCount(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
            >
              {choiceCountOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-black mb-2">Tags (phân cách bằng dấu phẩy)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Ví dụ: ngữ pháp, từ vựng, dễ"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">Câu hỏi</label>
          <textarea
            name="question"
            value={formData.question}
            onChange={handleInputChange}
            placeholder="Nhập nội dung câu hỏi..."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">Mô tả (tùy chọn)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Nhập mô tả câu hỏi nếu có..."
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500 resize-none"
          />
        </div>

        <h3 className="text-md font-semibold text-black mb-3">Các lựa chọn</h3>
        <div className="space-y-3">
          {formData.choices.map((choice, choiceIndex) => (
            <div key={choice.id} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <input
                type="radio"
                name={`correct_choice`}
                checked={choice.isCorrect}
                onChange={(e) => updateChoice(choice.id, 'isCorrect', e.target.checked)}
                className="mt-2 form-radio h-4 w-4 text-blue-600"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={choice.text}
                  onChange={(e) => updateChoice(choice.id, 'text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500 mb-2"
                  placeholder={`Lựa chọn ${String.fromCharCode(65 + choiceIndex)}`}
                />
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => toggleExplanation(choice.id)}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                  >
                    {showExplanations[`${formData.id}-${choice.id}`] ? 'Ẩn giải thích' : 'Thêm giải thích (tùy chọn)'}
                  </button>
                </div>
                {showExplanations[`${formData.id}-${choice.id}`] && (
                  <textarea
                    value={choice.explanation}
                    onChange={(e) => updateChoice(choice.id, 'explanation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500 text-sm min-h-[40px]"
                    placeholder="Nhập ghi chú giải thích..."
                  ></textarea>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionView;
