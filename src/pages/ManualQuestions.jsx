import React, { useState } from "react";
import { toast } from "react-toastify";
import SidebarMenu from "../components/SidebarMenu";
import ConfirmModal from "../components/ConfirmModal";
import { createQuestions } from "../api/questionApi.js";
import { TrashIcon } from "@heroicons/react/24/outline";

const ManualQuestions = () => {
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      question: "",
      description: "",
      type: 1,
      points: 1,
      tags: "",
      choices: [
        { id: 1, text: "", isCorrect: false, explanation: "" },
        { id: 2, text: "", isCorrect: false, explanation: "" },
        { id: 3, text: "", isCorrect: false, explanation: "" },
        { id: 4, text: "", isCorrect: false, explanation: "" },
      ],
      selected: false,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "default",
  });
  const [showExplanations, setShowExplanations] = useState({});

  const questionTypes = [
    { value: 1, label: "Khác" },
    { value: 2, label: "Từ vựng" },
  ];

  const choiceCountOptions = [
    { value: 2, label: "2 lựa chọn" },
    { value: 3, label: "3 lựa chọn" },
    { value: 4, label: "4 lựa chọn" },
    { value: 5, label: "5 lựa chọn" },
  ];

  // Add new question
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: "",
      description: "",
      type: 1,
      points: 1,
      tags: "",
      choices: [
        { id: 1, text: "", isCorrect: false, explanation: "" },
        { id: 2, text: "", isCorrect: false, explanation: "" },
        { id: 3, text: "", isCorrect: false, explanation: "" },
        { id: 4, text: "", isCorrect: false, explanation: "" },
      ],
      selected: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  // Remove question
  const removeQuestion = (questionId) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  // Toggle question selection
  const toggleQuestionSelection = (questionId) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, selected: !q.selected } : q
      )
    );
  };

  // Update question field
  const updateQuestion = (questionId, field, value) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, [field]: value } : q))
    );
  };

  // Update choice count
  const updateChoiceCount = (questionId, newCount) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const currentChoices = q.choices;
          let newChoices = [...currentChoices];

          if (newCount > currentChoices.length) {
            // Add new choices
            for (let i = currentChoices.length + 1; i <= newCount; i++) {
              newChoices.push({
                id: i,
                text: "",
                isCorrect: false,
                explanation: "",
              });
            }
          } else if (newCount < currentChoices.length) {
            // Remove excess choices
            newChoices = newChoices.slice(0, newCount);
          }

          return { ...q, choices: newChoices };
        }
        return q;
      })
    );
  };

  // Toggle explanation visibility
  const toggleExplanation = (questionId, choiceId) => {
    const key = `${questionId}-${choiceId}`;
    setShowExplanations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  const updateChoice = (questionId, choiceId, field, value) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const updatedChoices = q.choices.map((choice) => {
            if (choice.id === choiceId) {
              if (field === "isCorrect" && value) {
                // If setting this choice as correct, unset others
                return { ...choice, [field]: value };
              } else if (field === "isCorrect" && !value) {
                return { ...choice, [field]: value };
              }
              return { ...choice, [field]: value };
            } else if (field === "isCorrect" && value) {
              // Unset other choices when one is selected as correct
              return { ...choice, isCorrect: false };
            }
            return choice;
          });
          return { ...q, choices: updatedChoices };
        }
        return q;
      })
    );
  };

  // Save questions to database
  const saveQuestions = async () => {
    const selectedQuestions = questions.filter((q) => q.selected);

    if (selectedQuestions.length === 0) {
      toast.error("Vui lòng chọn ít nhất một câu hỏi để lưu");
      return;
    }

    // Validate questions
    for (const q of selectedQuestions) {
      if (!q.question.trim()) {
        toast.error("Vui lòng nhập nội dung câu hỏi");
        return;
      }

      const hasCorrectAnswer = q.choices.some((choice) => choice.isCorrect);
      const hasAllChoices = q.choices.every((choice) => choice.text.trim());

      if (!hasCorrectAnswer) {
        toast.error("Vui lòng chọn đáp án đúng cho câu hỏi");
        return;
      }

      if (!hasAllChoices) {
        toast.error("Vui lòng điền đầy đủ các lựa chọn");
        return;
      }
    }

    try {
      setLoading(true);

      // Transform data to match backend API
      const questionsData = {
        questions: selectedQuestions.map((q) => ({
          content: q.question,
          description: q.description || "",
          score: q.points,
          type: q.type,
          tags: q.tags || "",
          by_ai: false,
          choices: q.choices.map((choice) => ({
            content: choice.text,
            is_correct: choice.isCorrect,
            explanation: choice.explanation || "",
          })),
        })),
      };

      const response = await createQuestions(questionsData);

      if (response.code === "SUCCESS") {
        toast.success("Lưu câu hỏi thành công!");
        // Remove saved questions from list
        setQuestions(questions.filter((q) => !q.selected));
      }
    } catch (error) {
      console.error("Error saving questions:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi lưu câu hỏi";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear all questions
  const clearAll = () => {
    setConfirmModal({
      isOpen: true,
      title: "Xóa tất cả nội dung",
      message:
        "Bạn có chắc chắn muốn xóa tất cả nội dung các ô? Hành động này không thể hoàn tác.",
      type: "warning",
      onConfirm: () => performClearAll(),
    });
  };

  const performClearAll = () => {
    setQuestions([
      {
        id: Date.now(),
        question: "",
        description: "",
        type: 1,
        points: 1,
        tags: "",
        choices: [
          { id: 1, text: "", isCorrect: false, explanation: "" },
          { id: 2, text: "", isCorrect: false, explanation: "" },
          { id: 3, text: "", isCorrect: false, explanation: "" },
          { id: 4, text: "", isCorrect: false, explanation: "" },
        ],
        selected: true,
      },
    ]);
    toast.success("Đã xóa tất cả nội dung");
  };

  // Close modal
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: null,
      type: "default",
    });
  };

  return (
    <div className="flex gap-4 bg-gray-100 min-h-screen p-4">
      {/* Sidebar */}
      <div className="w-80">
        <SidebarMenu />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div
          className="bg-white rounded-lg shadow-sm p-8"
          style={{ minHeight: "calc(100vh - 32px)" }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                Tạo câu hỏi thủ công
              </h1>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="border border-gray-200 rounded-lg p-3 relative bg-white transition-shadow hover:shadow-md hover:-translate-y-0.5 hover:bg-gray-50 duration-150"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={question.selected}
                      onChange={() => toggleQuestionSelection(question.id)}
                      className="w-4 h-4 text-[#2D3E83] rounded focus:ring-[#2D3E83]"
                    />
                    <span className="font-semibold text-black">
                      Câu {index + 1}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeQuestion(question.id)}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition"
                    title="Xóa câu hỏi"
                  >
                    <TrashIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Question Fields (compact) */}
                <div className="grid grid-cols-3 gap-2 mb-3 items-end">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Điểm
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={question.points}
                      onChange={(e) =>
                        updateQuestion(
                          question.id,
                          "points",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D3E83] text-slate-800 font-medium hover:shadow-sm transition duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Kiểu
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) =>
                        updateQuestion(
                          question.id,
                          "type",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D3E83] text-slate-800 font-medium hover:shadow-sm transition duration-150"
                    >
                      {questionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Lựa chọn
                    </label>
                    <select
                      value={question.choices.length}
                      onChange={(e) =>
                        updateChoiceCount(question.id, parseInt(e.target.value))
                      }
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D3E83] text-slate-800 font-medium hover:shadow-sm transition duration-150"
                    >
                      {choiceCountOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-3">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Câu hỏi
                  </label>
                  <textarea
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(question.id, "question", e.target.value)
                    }
                    placeholder="Nhập nội dung câu hỏi..."
                    rows="2"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D3E83] text-slate-800 font-medium placeholder-gray-500 hover:shadow-sm transition duration-150 resize-none"
                  />
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Mô tả (tùy chọn)
                    </label>
                    <textarea
                      value={question.description}
                      onChange={(e) =>
                        updateQuestion(
                          question.id,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Nhập mô tả câu hỏi nếu có..."
                      rows="2"
                      className="w-full px-2 py-1.5 h-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D3E83] text-slate-800 font-medium placeholder-gray-500 hover:shadow-sm transition duration-150 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Tags (không bắt buộc)
                    </label>
                    <input
                      type="text"
                      value={question.tags}
                      onChange={(e) =>
                        updateQuestion(question.id, "tags", e.target.value)
                      }
                      placeholder="Nhập tags, phân cách bằng dấu phẩy (ví dụ: grammar, beginner)"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D3E83] text-slate-800 font-medium placeholder-gray-500 resize none"
                    />
                  </div>
                </div>

                {/* Choices */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Các lựa chọn
                  </label>
                  <div className="space-y-2">
                    {question.choices.map((choice) => {
                      const explanationKey = `${question.id}-${choice.id}`;
                      const showExplanation = showExplanations[explanationKey];

                      return (
                        <div
                          key={choice.id}
                          className="border border-gray-200 rounded-lg p-2 transition bg-white hover:bg-gray-50 hover:shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={choice.isCorrect}
                              onChange={(e) =>
                                updateChoice(
                                  question.id,
                                  choice.id,
                                  "isCorrect",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-[#2D3E83] focus:ring-[#2D3E83]"
                            />
                            <input
                              type="text"
                              value={choice.text}
                              onChange={(e) =>
                                updateChoice(
                                  question.id,
                                  choice.id,
                                  "text",
                                  e.target.value
                                )
                              }
                              placeholder={`Lựa chọn ${choice.id}`}
                              className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D3E83] text-slate-800 font-medium placeholder-gray-500 hover:shadow-sm transition duration-150"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                toggleExplanation(question.id, choice.id)
                              }
                              className="px-2 py-1 bg-gray-100 hover:bg-[#EEF2FF] rounded-md text-sm font-medium text-[#2D3E83] transition"
                            >
                              {showExplanation ? "Ẩn ghi chú" : "Ghi chú"}
                            </button>
                          </div>

                          {showExplanation && (
                            <div className="mt-2">
                              <input
                                type="text"
                                value={choice.explanation}
                                onChange={(e) =>
                                  updateChoice(
                                    question.id,
                                    choice.id,
                                    "explanation",
                                    e.target.value
                                  )
                                }
                                placeholder="Nhập ghi chú giải thích..."
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D3E83] text-slate-800 font-medium placeholder-gray-500 hover:shadow-sm transition duration-150"
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
              className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition font-medium"
            >
              + Thêm câu hỏi mới
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={saveQuestions}
              disabled={loading}
              className="bg-cyan-500 text-white px-5 py-2.5 rounded-lg hover:bg-cyan-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang lưu..." : "Lưu vào ngân hàng câu hỏi"}
            </button>
            <button
              onClick={clearAll}
              disabled={loading}
              className="bg-red-500 text-white px-5 py-2.5 rounded-lg hover:bg-red-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
