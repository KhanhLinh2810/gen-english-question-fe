import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";
import {
  createExamAttempt,
  getExamAttemptDetail,
  saveAnswer,
  submitExam,
} from "../api/examAttemptApi";

const TakeExam = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const examId = searchParams.get("exam_id");
  const attemptIdRef = useRef(null);
  const autoSubmittedRef = useRef(false); // NEW: Ngăn gọi auto submit nhiều lần

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
        toast.error("Không tìm thấy đề thi");
        navigate("/exam-bank");
        return;
      }

      try {
        setLoading(true);
        const response = await createExamAttempt(parseInt(examId));

        if (response.code === "SUCCESS") {
          const attempt = response.data;
          attemptIdRef.current = attempt.id;

          let examData = attempt;

          if (!attempt.list_question || attempt.list_question.length === 0) {
            const detailResponse = await getExamAttemptDetail(attempt.id);
            if (detailResponse.code === "SUCCESS") {
              examData = detailResponse.data;
            }
          }

          setExamAttempt(examData);

          // Init selected answers
          const initialAnswers = {};
          if (examData.list_answer && examData.list_answer.length > 0) {
            examData.list_answer.forEach((a) => {
              if (a.choice_id) {
                const qId = parseInt(a.question_id);
                const cId = parseInt(a.choice_id);
                if (!isNaN(qId) && !isNaN(cId)) {
                  initialAnswers[qId] = cId;
                }
              }
            });
          }
          setAnswers(initialAnswers);

          // Init remaining time
          const durationMinutes = examData.duration || 0;
          const startedAt = new Date(examData.started_at);
          const endTime = new Date(
            startedAt.getTime() + durationMinutes * 60 * 1000
          );
          const now = new Date();
          const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
          setTimeRemaining(remaining);
        }
      } catch (error) {
        let msg = "Có lỗi xảy ra khi khởi tạo bài thi";

        const e = error.response?.data;
        if (e) {
          if (e.data?.message) msg = e.data.message;
          else if (e.message) msg = e.message;

          if (e.code === "no_more_turns")
            msg = e.data?.message || "Bạn đã hết lượt làm bài";
        }

        toast.error(msg);
        navigate("/exam-bank");
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [examId, navigate]);

  // Submit exam function
  const handleSubmitExam = async () => {
    if (submitting || isSubmitted || autoSubmittedRef.current) return;

    autoSubmittedRef.current = true; // NEW: chặn double-submit ngay lập tức
    setShowConfirmModal(false);

    try {
      setSubmitting(true);
      setIsSubmitted(true);
      setTimeRemaining(0);

      const allQuestionIds = examAttempt?.list_question?.map((q) => q.id) || [];

      const answerList = allQuestionIds.map((qid) => ({
        question_id: parseInt(qid),
        choice_id: answers[qid] ? parseInt(answers[qid]) : null,
      }));

      if (attemptIdRef.current) {
        const response = await submitExam(attemptIdRef.current, answerList);

        // If we reach here without error, submission was successful
        toast.success("Nộp bài thành công!");

        // Navigate immediately to result page and replace history so user can't go back to takeExam
        navigate(`/exam-result?attempt_id=${attemptIdRef.current}`, {
          replace: true,
        });
        return;
      }
    } catch (error) {
      setIsSubmitted(false);
      autoSubmittedRef.current = false; // giải khoá nếu submit FAILED

      let msg = "Có lỗi xảy ra khi nộp bài";
      const e = error.response?.data;

      if (e?.message) msg = e.message;
      if (e?.code === "exam_submission_closed") {
        toast.info("Bài thi đã được nộp. Chuyển đến trang kết quả...");
        navigate(`/exam-result?attempt_id=${attemptIdRef.current}`, {
          replace: true,
        });
        return;
      }

      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || !examAttempt || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // time's up -> call submit handler (it will guard double-submit itself)
          setTimeout(() => {
            handleSubmitExam();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, examAttempt, isSubmitted]);

  useEffect(() => {
    if (isSubmitted && attemptIdRef.current) {
      // replace so user cannot go back to the takeExam page
      navigate(`/exam-result?attempt_id=${attemptIdRef.current}`, {
        replace: true,
      });
    }
  }, [isSubmitted, navigate]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // Handle answer selection
  const handleAnswerSelect = async (questionId, choiceId) => {
    if (isSubmitted || submitting) return;

    const qId = parseInt(questionId);
    const cId = parseInt(choiceId);
    if (isNaN(qId) || isNaN(cId)) return;

    setAnswers((prev) => ({ ...prev, [qId]: cId }));

    try {
      await saveAnswer(attemptIdRef.current, [
        { question_id: qId, choice_id: cId },
      ]);
    } catch {
      // silent fail
    }
  };

  const goToQuestion = (i) => {
    if (i >= 0 && i < examAttempt.list_question.length) {
      setCurrentQuestionIndex(i);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0)
      setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const goToNext = () => {
    if (currentQuestionIndex < examAttempt.list_question.length - 1)
      setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  // RENDER
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32">
        <div className="text-black text-xl">Đang tải đề thi...</div>
      </div>
    );
  }

  if (!examAttempt || !examAttempt.list_question?.length) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32">
        <div className="text-black text-xl">Không tìm thấy đề thi</div>
      </div>
    );
  }

  const currentQuestion = examAttempt.list_question[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === examAttempt.list_question.length - 1;

  return (
    <div className="min-h-screen bg-white flex flex-col text-black px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32">
      {/* scale down entire exam UI to ~80% for overall size reduction */}
      <div className="w-full transform md:scale-[0.8] md:origin-top">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-black text-4xl md:text-5xl font-extrabold leading-tight">
                {examAttempt.exam?.title || "Đề thi"}
              </h1>
              <p className="mt-2 text-sm md:text-base text-slate-600">
                Bạn đang làm đề thi:{" "}
                <span className="font-semibold text-slate-800">
                  {examAttempt.exam?.title || "Đề thi"}
                </span>
              </p>
            </div>
            <div className="ml-6">
              <div className="bg-[#2D3E83] text-white px-5 py-2 rounded-lg font-semibold text-lg">
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* MOBILE: question header + horizontal question strip (visible on small screens) */}
          <div className="md:hidden w-full">
            <div className="flex items-center justify-between px-3 py-2">
              <h3 className="text-l font-medium">Danh sách câu hỏi</h3>

              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={submitting || isSubmitted}
                className="bg-[#2D3E83] text-white px-3 py-1 rounded-md text-sm font-semibold disabled:opacity-50"
              >
                {submitting ? "Đang nộp" : isSubmitted ? "Đã nộp" : "NỘP"}
              </button>
            </div>

            <div className="overflow-x-auto py-2">
              <div className="inline-flex px-2 space-x-3">
                {examAttempt.list_question.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(idx)}
                      className={`w-12 h-12 rounded-md font-semibold flex items-center justify-center border ${
                        isCurrent
                          ? "bg-[#2D3E83] text-white border-[#2D3E83]"
                          : isAnswered
                          ? "bg-emerald-100 text-black border-emerald-200"
                          : "bg-slate-100 text-black border-gray-100 hover:bg-slate-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* LEFT SIDEBAR (desktop/tablet) */}
          <aside className="hidden md:flex md:w-80 bg-white p-4 flex flex-col border-r border-gray-100">
            <h3 className="text-black text-xl font-medium mb-3">
              Danh sách câu hỏi
            </h3>

            <div className="grid grid-cols-4 gap-3 mb-4">
              {examAttempt.list_question.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={`w-12 h-12 rounded-lg font-semibold border text-sm md:text-lg ${
                      isCurrent
                        ? "bg-[#2D3E83] text-white border-[#2D3E83]"
                        : isAnswered
                        ? "bg-emerald-100 text-black border-emerald-200"
                        : "bg-slate-100 text-black border-gray-100 hover:bg-slate-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={submitting || isSubmitted}
              className="mt-auto bg-[#2D3E83] hover:bg-[#25336a] text-white py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {submitting ? "Đang nộp..." : isSubmitted ? "Đã nộp" : "NỘP BÀI"}
            </button>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-black text-xl md:text-2xl font-bold mb-6">
                Câu hỏi số {currentQuestionIndex + 1}
              </h2>

              <section className="bg-white rounded-lg p-6 mb-4 shadow-sm border border-gray-100">
                <p className="text-black font-semibold text-xl md:text-2xl mb-4">
                  {currentQuestion.content}
                </p>

                {currentQuestion.description && (
                  <p className="text-gray-600 text-base md:text-lg italic mb-4">
                    {currentQuestion.description}
                  </p>
                )}

                {/* Choices */}
                <div className="space-y-3">
                  {currentQuestion.choices?.map((choice, idx) => {
                    const selected = answers[currentQuestion.id] === choice.id;
                    const label = String.fromCharCode(65 + idx);

                    return (
                      <label
                        key={choice.id}
                        htmlFor={`ch-${choice.id}`}
                        className={`flex items-start gap-4 p-4 rounded-lg border ${
                          selected
                            ? "border-[#2D3E83] bg-[#f1f5fb]"
                            : "border-gray-100 bg-white hover:bg-slate-50"
                        } cursor-pointer`}
                      >
                        <input
                          type="radio"
                          id={`ch-${choice.id}`}
                          checked={selected}
                          onChange={() =>
                            handleAnswerSelect(currentQuestion.id, choice.id)
                          }
                          disabled={isSubmitted}
                          className="mt-1 w-4 h-4"
                        />

                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm md:text-base font-semibold text-slate-700">
                              {label}
                            </div>
                            <div className="text-black text-base md:text-lg">
                              {choice.content}
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* Nav buttons */}
              <div className="flex justify-end gap-3 mt-6">
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={goToPrevious}
                    className="bg-white border border-gray-200 text-black px-6 py-2 rounded-lg font-medium transition hover:shadow-sm"
                  >
                    Câu trước
                  </button>
                )}

                {!isLastQuestion ? (
                  <button
                    onClick={goToNext}
                    className="bg-[#2D3E83] hover:bg-[#25336a] text-white px-6 py-2 rounded-lg"
                  >
                    {submitting
                      ? "Đang nộp..."
                      : isSubmitted
                      ? "Đã nộp"
                      : "Câu sau"}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={submitting || isSubmitted}
                    className="bg-[#2D3E83] hover:bg-[#25336a] text-white px-6 py-2 rounded-lg disabled:opacity-50"
                  >
                    {submitting
                      ? "Đang nộp..."
                      : isSubmitted
                      ? "Đã nộp"
                      : "Nộp bài"}
                  </button>
                )}
              </div>
            </div>
          </main>
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
