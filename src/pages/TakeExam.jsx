import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';
import { createExamAttempt, getExamAttemptDetail, saveAnswer, submitExam } from '../api/examAttemptApi';

const TakeExam = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const examId = searchParams.get('exam_id');
  const attemptIdRef = useRef(null);

  const [examAttempt, setExamAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: choiceId }
  const [timeRemaining, setTimeRemaining] = useState(0); // seconds
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize exam attempt
  useEffect(() => {
    const initExam = async () => {
      if (!examId) {
        toast.error('Không tìm thấy đề thi');
        navigate('/exam-bank');
        return;
      }

      try {
        setLoading(true);
        const response = await createExamAttempt(parseInt(examId));
        
        if (response.code === 'SUCCESS') {
          const attempt = response.data;
          attemptIdRef.current = attempt.id;
          
          // Use response data directly if it has list_question, otherwise load detail
          let examData = attempt;
          
          if (!attempt.list_question || attempt.list_question.length === 0) {
            // Load full attempt detail if not in response
            const detailResponse = await getExamAttemptDetail(attempt.id);
            if (detailResponse.code === 'SUCCESS') {
              examData = detailResponse.data;
            }
          }
          
          setExamAttempt(examData);
          
          // Initialize answers from existing list_answer
          const initialAnswers = {};
          if (examData.list_answer && examData.list_answer.length > 0) {
            examData.list_answer.forEach(answer => {
              if (answer.choice_id) {
                // Ensure both are integers
                const qId = parseInt(answer.question_id);
                const cId = parseInt(answer.choice_id);
                if (!isNaN(qId) && !isNaN(cId)) {
                  initialAnswers[qId] = cId;
                }
              }
            });
          }
          setAnswers(initialAnswers);
          
          // Calculate time remaining
          const durationMinutes = examData.duration || 0;
          const startedAt = new Date(examData.started_at);
          const endTime = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
          const now = new Date();
          const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
          setTimeRemaining(remaining);
        }
      } catch (error) {
        console.error('Error initializing exam:', error);
        let errorMessage = 'Có lỗi xảy ra khi khởi tạo bài thi';
        
        if (error.response?.data) {
          const errorData = error.response.data;
          // Check for detailed error message
          if (errorData.data?.message) {
            errorMessage = errorData.data.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
          
          // Handle specific error codes
          if (errorData.code === 'no_more_turns' && errorData.data) {
            errorMessage = errorData.data.message || `Bạn đã làm bài ${errorData.data.current_attempts}/${errorData.data.max_attempts} lần. Không thể làm thêm.`;
          } else if (errorData.code === 'overdue_doing_exam') {
            errorMessage = 'Thời gian làm bài đã hết. Không thể bắt đầu làm bài mới.';
          } else if (errorData.code === 'exam_already_started') {
            errorMessage = 'Bạn đang có một bài thi chưa hoàn thành. Vui lòng hoàn thành bài thi đó trước.';
          }
        }
        
        toast.error(errorMessage);
        navigate('/exam-bank');
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [examId, navigate]);

  // Submit exam function
  const handleSubmitExam = async () => {
    // Prevent multiple submissions
    if (submitting || isSubmitted) return;
    setShowConfirmModal(false);

    try {
      setSubmitting(true);
      setIsSubmitted(true); // Mark as submitted to prevent double submit
      
      // Stop timer by setting timeRemaining to 0
      setTimeRemaining(0);
      
      // Prepare answers - include all questions from exam, even if not answered
      const allQuestionIds = examAttempt?.list_question?.map(q => q.id) || [];
      const answerList = allQuestionIds.map(questionId => {
        const choiceId = answers[questionId];
        return {
          question_id: parseInt(questionId),
          choice_id: choiceId ? parseInt(choiceId) : null
        };
      }).filter(item => !isNaN(item.question_id));

      if (attemptIdRef.current) {
        const response = await submitExam(attemptIdRef.current, answerList);
        
        // If we reach here without error, submission was successful
        toast.success('Nộp bài thành công!');
        
        // Navigate immediately to result page - use window.location for immediate redirect
        window.location.href = `/exam-result?attempt_id=${attemptIdRef.current}`;
        return; // Exit function immediately
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      console.error('Error details:', error.response?.data);
      
      // Reset submitted state on error so user can try again if needed
      setIsSubmitted(false);
      
      let errorMessage = 'Có lỗi xảy ra khi nộp bài';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.code === 'exam_submission_closed') {
          // If already submitted, redirect to result page
          if (attemptIdRef.current) {
            toast.info('Bài thi đã được nộp. Đang chuyển đến trang kết quả...');
            setTimeout(() => {
              navigate(`/exam-result?attempt_id=${attemptIdRef.current}`);
            }, 1000);
            return;
          }
          errorMessage = 'Bài thi đã được nộp hoặc thời gian đã hết. Không thể nộp bài.';
        } else if (errorData.errors?.[0]?.message) {
          errorMessage = errorData.errors[0].message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || !examAttempt || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up, auto submit
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, examAttempt, isSubmitted]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerSelect = async (questionId, choiceId) => {
    // Don't allow answer changes after submission
    if (isSubmitted || submitting) return;
    
    // Ensure questionId and choiceId are integers
    const qId = parseInt(questionId);
    const cId = parseInt(choiceId);
    
    if (isNaN(qId) || isNaN(cId)) {
      console.error('Invalid questionId or choiceId:', questionId, choiceId);
      return;
    }

    const newAnswers = { ...answers, [qId]: cId };
    setAnswers(newAnswers);

    // Save answer to backend
    if (attemptIdRef.current && !isSubmitted) {
      try {
        await saveAnswer(attemptIdRef.current, [
          { question_id: qId, choice_id: cId }
        ]);
      } catch (error) {
        // Silently fail - user can continue answering
        // If exam was submitted, they will be redirected on next action
        console.error('Error saving answer:', error);
      }
    }
  };

  // Navigate to question
  const goToQuestion = (index) => {
    if (index >= 0 && index < (examAttempt?.list_question?.length || 0)) {
      setCurrentQuestionIndex(index);
    }
  };

  // Previous question
  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Next question
  const goToNext = () => {
    if (currentQuestionIndex < (examAttempt?.list_question?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-950 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải đề thi...</div>
      </div>
    );
  }

  if (!examAttempt || !examAttempt.list_question || examAttempt.list_question.length === 0) {
    return (
      <div className="min-h-screen bg-indigo-950 flex items-center justify-center">
        <div className="text-white text-xl">Không tìm thấy đề thi</div>
      </div>
    );
  }

  const currentQuestion = examAttempt.list_question[currentQuestionIndex];
  const totalQuestions = examAttempt.list_question.length;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="min-h-screen bg-indigo-950 flex flex-col">
      {/* Header */}
      <div className="bg-indigo-950 px-6 py-4 flex items-center justify-between">
        <h1 className="text-white text-xl font-semibold">
          {examAttempt.exam?.title || 'Đề thi'}
        </h1>
        <div className="bg-teal-500 text-white px-6 py-2 rounded-lg font-semibold text-lg">
          {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-indigo-900 p-4 flex flex-col">
          {/* Question Navigation Grid */}
          <div className="mb-4">
            <h3 className="text-white text-sm font-medium mb-3">Câu hỏi</h3>
            <div className="grid grid-cols-4 gap-2">
              {examAttempt.list_question.map((question, index) => {
                const isAnswered = answers[question.id] !== undefined;
                const isCurrent = index === currentQuestionIndex;
                
                return (
                  <button
                    key={question.id}
                    onClick={() => goToQuestion(index)}
                    className={`w-10 h-10 rounded-lg font-semibold transition ${
                      isCurrent
                        ? 'bg-teal-500 text-white'
                        : isAnswered
                        ? 'bg-indigo-700 text-white'
                        : 'bg-indigo-800 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={submitting || isSubmitted}
            className="mt-auto bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {submitting ? 'Đang nộp...' : isSubmitted ? 'Đã nộp' : 'NỘP BÀI'}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-indigo-800 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Question Title */}
            <h2 className="text-blue-100 text-2xl font-bold mb-6">
              Nội dung câu hỏi số {currentQuestionIndex + 1}
            </h2>

            {/* Question Content */}
            <div className="bg-white rounded-lg p-6 mb-4">
              <div className="mb-4">
                <div className="flex items-start gap-3 mb-4">
                  <input
                    type="radio"
                    checked={false}
                    readOnly
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium text-lg">
                      {currentQuestion.content}
                    </p>
                    {currentQuestion.description && (
                      <p className="text-gray-600 text-sm mt-2 italic">
                        {currentQuestion.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Choices */}
              <div className="space-y-3">
                {currentQuestion.choices && currentQuestion.choices.map((choice, choiceIndex) => {
                  const isSelected = answers[currentQuestion.id] === choice.id;
                  const choiceLabel = String.fromCharCode(65 + choiceIndex); // A, B, C, D
                  
                  return (
                    <div key={choice.id} className="flex items-start gap-3">
                      <input
                        type="radio"
                        id={`choice-${choice.id}`}
                        name={`question-${currentQuestion.id}`}
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(currentQuestion.id, choice.id)}
                        disabled={isSubmitted || submitting}
                        className="mt-1 w-4 h-4"
                      />
                      <label
                        htmlFor={`choice-${choice.id}`}
                        className="flex-1 text-gray-800 cursor-pointer"
                      >
                        <span className="font-medium">{choiceLabel}.</span> {choice.content}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              {!isFirstQuestion && (
                <button
                  onClick={goToPrevious}
                  className="bg-indigo-700 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Câu trước
                </button>
              )}
              {isLastQuestion ? (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={submitting || isSubmitted}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {submitting ? 'Đang nộp...' : isSubmitted ? 'Đã nộp' : 'Kết thúc'}
                </button>
              ) : (
                <button
                  onClick={goToNext}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Câu sau
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleSubmitExam}
        title="Xác nhận nộp bài"
        message="Bạn có chắc chắn muốn nộp bài? Sau khi nộp bài, bạn sẽ không thể chỉnh sửa câu trả lời."
        confirmText="Nộp bài"
        cancelText="Hủy"
        type="warning"
      />
    </div>
  );
};

export default TakeExam;

