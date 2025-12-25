import React, { useState } from 'react';
import { toast } from 'react-toastify';
import SidebarMenu from '../components/SidebarMenu';
import ConfirmModal from '../components/ConfirmModal';
import { createQuestions } from '../api/questionApi.js';

const ManualQuestions = () => {
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      question: '',
      description: '',
      type: 1,
      points: 1,
      tags: '',
      choices: [
        { id: 1, text: '', isCorrect: false, explanation: '' },
        { id: 2, text: '', isCorrect: false, explanation: '' },
        { id: 3, text: '', isCorrect: false, explanation: '' },
        { id: 4, text: '', isCorrect: false, explanation: '' }
      ],
      selected: false
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'default'
  });
  const [showExplanations, setShowExplanations] = useState({});

  const questionTypes = [
    { value: 1, label: 'Khác' },
    { value: 2, label: 'Từ vựng' }
  ];

  const choiceCountOptions = [
    { value: 2, label: '2 lựa chọn' },
    { value: 3, label: '3 lựa chọn' },
    { value: 4, label: '4 lựa chọn' },
    { value: 5, label: '5 lựa chọn' }
  ];

  // Add new question
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      description: '',
      type: 1,
      points: 1,
      tags: '',
      choices: [
        { id: 1, text: '', isCorrect: false, explanation: '' },
        { id: 2, text: '', isCorrect: false, explanation: '' },
        { id: 3, text: '', isCorrect: false, explanation: '' },
        { id: 4, text: '', isCorrect: false, explanation: '' }
      ],
      selected: false
    };
    setQuestions([...questions, newQuestion]);
  };

  // Remove question
  const removeQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  // Toggle question selection
  const toggleQuestionSelection = (questionId) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, selected: !q.selected } : q
    ));
  };

  // Update question field
  const updateQuestion = (questionId, field, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  // Update choice count
  const updateChoiceCount = (questionId, newCount) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const currentChoices = q.choices;
        let newChoices = [...currentChoices];
        
        if (newCount > currentChoices.length) {
          // Add new choices
          for (let i = currentChoices.length + 1; i <= newCount; i++) {
            newChoices.push({
              id: i,
              text: '',
              isCorrect: false,
              explanation: ''
            });
          }
        } else if (newCount < currentChoices.length) {
          // Remove excess choices
          newChoices = newChoices.slice(0, newCount);
        }
        
        return { ...q, choices: newChoices };
      }
      return q;
    }));
  };

  // Toggle explanation visibility
  const toggleExplanation = (questionId, choiceId) => {
    const key = `${questionId}-${choiceId}`;
    setShowExplanations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  const updateChoice = (questionId, choiceId, field, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const updatedChoices = q.choices.map(choice => {
          if (choice.id === choiceId) {
            if (field === 'isCorrect' && value) {
              // If setting this choice as correct, unset others
              return { ...choice, [field]: value };
            } else if (field === 'isCorrect' && !value) {
              return { ...choice, [field]: value };
            }
            return { ...choice, [field]: value };
          } else if (field === 'isCorrect' && value) {
            // Unset other choices when one is selected as correct
            return { ...choice, isCorrect: false };
          }
          return choice;
        });
        return { ...q, choices: updatedChoices };
      }
      return q;
    }));
  };

  // Save questions to database
  const saveQuestions = async () => {
    const selectedQuestions = questions.filter(q => q.selected);
    
    if (selectedQuestions.length === 0) {
      toast.error('Vui lòng chọn ít nhất một câu hỏi để lưu');
      return;
    }

    // Validate questions
    for (const q of selectedQuestions) {
      if (!q.question.trim()) {
        toast.error('Vui lòng nhập nội dung câu hỏi');
        return;
      }
      
      const hasCorrectAnswer = q.choices.some(choice => choice.isCorrect);
      const hasAllChoices = q.choices.every(choice => choice.text.trim());
      
      if (!hasCorrectAnswer) {
        toast.error('Vui lòng chọn đáp án đúng cho câu hỏi');
        return;
      }
      
      if (!hasAllChoices) {
        toast.error('Vui lòng điền đầy đủ các lựa chọn');
        return;
      }
    }

    try {
      setLoading(true);
      
      // Transform data to match backend API
      const questionsData = {
        questions: selectedQuestions.map(q => ({
          content: q.question,
          description: q.description || '',
          score: q.points,
          type: q.type,
          tags: q.tags || '',
          by_ai: false,
          choices: q.choices.map(choice => ({
            content: choice.text,
            is_correct: choice.isCorrect,
            explanation: choice.explanation || ''
          }))
        }))
      };
      
      const response = await createQuestions(questionsData);
      
      if (response.code === 'SUCCESS') {
        toast.success('Lưu câu hỏi thành công!');
        // Remove saved questions from list
        setQuestions(questions.filter(q => !q.selected));
      }
    } catch (error) {
      console.error('Error saving questions:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi lưu câu hỏi';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear all questions
  const clearAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa tất cả nội dung',
      message: 'Bạn có chắc chắn muốn xóa tất cả nội dung các ô? Hành động này không thể hoàn tác.',
      type: 'warning',
      onConfirm: () => performClearAll()
    });
  };

  const performClearAll = () => {
    setQuestions([{
      id: Date.now(),
      question: '',
      description: '',
      type: 1,
      points: 1,
      tags: '',
      choices: [
        { id: 1, text: '', isCorrect: false, explanation: '' },
        { id: 2, text: '', isCorrect: false, explanation: '' },
        { id: 3, text: '', isCorrect: false, explanation: '' },
        { id: 4, text: '', isCorrect: false, explanation: '' }
      ],
      selected: true
    }]);
    toast.success('Đã xóa tất cả nội dung');
  };

  // Close modal
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      type: 'default'
    });
  };

  return (
    <div className="flex gap-4 bg-gray-100 min-h-screen p-4">
      {/* Sidebar */}
      <div className="w-96">
        <SidebarMenu />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-sm p-6" style={{minHeight: 'calc(100vh - 32px)'}}>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-black mb-1">Tạo câu hỏi thủ công</h1>
              <p className="text-gray-600 text-sm">Tạo từng câu hỏi một cách thủ công</p>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4 relative">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={question.selected}
                      onChange={() => toggleQuestionSelection(question.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="font-semibold text-black">Câu {index + 1}</span>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => removeQuestion(question.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Xóa câu hỏi"
                  >
                    <span className="text-lg">🗑️</span>
                  </button>
                </div>

                {/* Question Fields */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Điểm</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={question.points}
                      onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Kiểu câu hỏi</label>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(question.id, 'type', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                    >
                      {questionTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Số lượng lựa chọn</label>
                    <select
                      value={question.choices.length}
                      onChange={(e) => updateChoiceCount(question.id, parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                    >
                      {choiceCountOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-black mb-2">Câu hỏi</label>
                  <textarea
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                    placeholder="Nhập nội dung câu hỏi..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500 resize-none"
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-black mb-2">Mô tả (tùy chọn)</label>
                  <textarea
                    value={question.description}
                    onChange={(e) => updateQuestion(question.id, 'description', e.target.value)}
                    placeholder="Nhập mô tả câu hỏi nếu có..."
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500 resize-none"
                  />
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-black mb-2">Tags (không bắt buộc)</label>
                  <input
                    type="text"
                    value={question.tags}
                    onChange={(e) => updateQuestion(question.id, 'tags', e.target.value)}
                    placeholder="Nhập tags, phân cách bằng dấu phẩy (ví dụ: grammar, vocabulary, beginner)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
                  />
                </div>

                {/* Choices */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-3">Các lựa chọn</label>
                  <div className="space-y-3">
                    {question.choices.map((choice) => {
                      const explanationKey = `${question.id}-${choice.id}`;
                      const showExplanation = showExplanations[explanationKey];
                      
                      return (
                        <div key={choice.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={choice.isCorrect}
                              onChange={(e) => updateChoice(question.id, choice.id, 'isCorrect', e.target.checked)}
                              className="w-4 h-4 text-green-600 focus:ring-green-500"
                            />
                            <input
                              type="text"
                              value={choice.text}
                              onChange={(e) => updateChoice(question.id, choice.id, 'text', e.target.value)}
                              placeholder={`Lựa chọn ${choice.id}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
                            />
                            <button
                              type="button"
                              onClick={() => toggleExplanation(question.id, choice.id)}
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition"
                            >
                              {showExplanation ? 'Ẩn ghi chú' : 'Ghi chú'}
                            </button>
                          </div>
                          
                          {showExplanation && (
                            <div className="mt-2">
                              <input
                                type="text"
                                value={choice.explanation}
                                onChange={(e) => updateChoice(question.id, choice.id, 'explanation', e.target.value)}
                                placeholder="Nhập ghi chú giải thích..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Button */}
          <div className="mt-6">
            <button
              onClick={addQuestion}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium"
            >
              + Thêm câu hỏi mới
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={saveQuestions}
              disabled={loading}
              className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang lưu...' : 'Lưu vào ngân hàng câu hỏi'}
            </button>
            <button
              onClick={clearAll}
              disabled={loading}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xóa nội dung các ô
            </button>
            </div>
          </div>

          {/* Confirm Modal */}
          <ConfirmModal
            isOpen={confirmModal.isOpen}
            onClose={closeConfirmModal}
            onConfirm={confirmModal.onConfirm}
            title={confirmModal.title}
            message={confirmModal.message}
            type={confirmModal.type}
            confirmText="Xóa"
            cancelText="Hủy"
          />
        </div>
      </div>
    );
  };

  export default ManualQuestions;
