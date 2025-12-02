import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SidebarMenu from '../components/SidebarMenu';
import { getExamAttemptResult } from '../api/examAttemptApi';

const ExamReview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const attemptId = searchParams.get('attempt_id');

  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReview = async () => {
      if (!attemptId) {
        toast.error('Không tìm thấy bài làm');
        navigate('/exam-bank');
        return;
      }

      try {
        setLoading(true);
        const response = await getExamAttemptResult(parseInt(attemptId));
        
        if (response.code === 'SUCCESS') {
          setExamData(response.data);
        }
      } catch (error) {
        console.error('Error loading exam review:', error);
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải bài làm';
        toast.error(errorMessage);
        navigate('/exam-bank');
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, [attemptId, navigate]);

  // Check if a question is answered correctly
  const isQuestionCorrect = (question) => {
    if (!question.choices || question.choices.length === 0) return false;
    
    // Get selected choices (user's answers)
    const selectedChoices = question.choices.filter(c => c.is_selected);
    const correctChoices = question.choices.filter(c => c.is_correct);
    
    // Check if all selected are correct and all correct are selected
    if (selectedChoices.length !== correctChoices.length) return false;
    
    return selectedChoices.every(selected => 
      correctChoices.some(correct => correct.id === selected.id)
    );
  };

  // Get selected choice for a question
  const getSelectedChoice = (question) => {
    if (!question.choices) return null;
    return question.choices.find(c => c.is_selected);
  };

  if (loading) {
    return (
      <div className="flex gap-4 bg-gray-100 min-h-screen p-4">
        <div className="w-96">
          <SidebarMenu />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600 text-xl">Đang tải bài làm...</div>
        </div>
      </div>
    );
  }

  if (!examData || !examData.list_question) {
    return (
      <div className="flex gap-4 bg-gray-100 min-h-screen p-4">
        <div className="w-96">
          <SidebarMenu />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600 text-xl">Không tìm thấy bài làm</div>
        </div>
      </div>
    );
  }

  // Sort questions by order
  const sortedQuestions = [...examData.list_question].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="flex gap-4 bg-gray-100 min-h-screen p-4">
      {/* Sidebar */}
      <div className="w-96">
        <SidebarMenu />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-sm p-6" style={{ minHeight: 'calc(100vh - 32px)' }}>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Xem lại Bài làm</h1>
            <p className="text-gray-600">
              Đề thi: <span className="font-semibold text-gray-800">{examData.exam?.title || 'N/A'}</span>
            </p>
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            {sortedQuestions.map((question, index) => {
              const isCorrect = isQuestionCorrect(question);
              const selectedChoice = getSelectedChoice(question);
              
              return (
                <div
                  key={question.id}
                  className={`border-2 rounded-lg p-5 ${
                    isCorrect
                      ? 'border-green-300 bg-green-50'
                      : 'border-red-300 bg-red-50'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-gray-800">
                        Câu {index + 1}
                      </span>
                      {isCorrect ? (
                        <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                          Đúng
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                          Sai
                        </span>
                      )}
                      {question.score && (
                        <span className="text-sm text-gray-500">
                          ({question.score} điểm)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="mb-4">
                    <p className="text-gray-800 font-medium mb-2">{question.content}</p>
                    {question.description && (
                      <p className="text-gray-600 text-sm italic">{question.description}</p>
                    )}
                  </div>

                  {/* Choices */}
                  <div className="space-y-2">
                    {question.choices && question.choices.map((choice, choiceIndex) => {
                      const choiceLabel = String.fromCharCode(65 + choiceIndex); // A, B, C, D
                      const isSelected = choice.is_selected;
                      const isCorrectChoice = choice.is_correct;
                      
                      let bgColor = 'bg-white';
                      let borderColor = 'border-gray-300';
                      let textColor = 'text-gray-800';
                      
                      if (isCorrectChoice) {
                        bgColor = 'bg-green-100';
                        borderColor = 'border-green-400';
                        textColor = 'text-green-800';
                      } else if (isSelected && !isCorrectChoice) {
                        bgColor = 'bg-red-100';
                        borderColor = 'border-red-400';
                        textColor = 'text-red-800';
                      }
                      
                      return (
                        <div
                          key={choice.id}
                          className={`border-2 rounded-lg p-3 ${bgColor} ${borderColor} ${textColor}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{choiceLabel}.</span>
                            <span>{choice.content}</span>
                            {isCorrectChoice && (
                              <span className="ml-auto text-green-600 font-semibold text-sm">
                                ✓ Đáp án đúng
                              </span>
                            )}
                            {isSelected && !isCorrectChoice && (
                              <span className="ml-auto text-red-600 font-semibold text-sm">
                                ✗ Bạn đã chọn
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Answer Status */}
                  {!selectedChoice && (
                    <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
                      ⚠ Bạn chưa chọn đáp án cho câu hỏi này
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Back Button */}
          <div className="mt-8">
            <button
              onClick={() => navigate(`/exam-result?attempt_id=${attemptId}`)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition shadow-sm"
            >
              Quay lại Kết quả
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamReview;

