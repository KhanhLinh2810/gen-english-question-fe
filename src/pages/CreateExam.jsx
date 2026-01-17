import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import SidebarMenu from "../components/SidebarMenu";
import { ChatBubbleLeftIcon, StarIcon } from "@heroicons/react/24/outline";
import { getQuestions } from "../api/questionApi.js";
import { createExam, getExamDetail, updateExam } from "../api/examApi.js";
import { QuestionTypes } from "../enums/question.js";

const CreateExam = () => {
  const [searchParams] = useSearchParams();
  const editExamId = searchParams.get("edit");
  const isEditMode = !!editExamId;

  const [examInfo, setExamInfo] = useState({
    title: "",
    description: "",
    timeLimit: 30, // minutes - default 30
    startTime: "",
    endTime: "",
    maxAttempts: 1,
    isPublic: true, // Default to public
    selectedQuestions: [],
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    selectedFilter: "all", // all, selected, unselected
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Load exam data for editing
  const loadExamForEdit = async (examId) => {
    try {
      setLoading(true);
      const response = await getExamDetail(examId);
      if (response.code === "SUCCESS") {
        const exam = response.data;
        setExamInfo({
          title: exam.title,
          description: exam.note || "",
          timeLimit: exam.duration || 30,
          startTime: exam.earliest_start_time
            ? new Date(exam.earliest_start_time).toISOString().slice(0, 16)
            : "",
          endTime: exam.lastest_start_time
            ? new Date(exam.lastest_start_time).toISOString().slice(0, 16)
            : "",
          maxAttempts: exam.max_attempt || 1,
          isPublic: exam.is_public !== undefined ? exam.is_public : true,
          selectedQuestions: exam.list_question.map((q) => ({
            id: q.id,
            score: q.score_in_exam || q.score,
          })),
        });
      }
    } catch (error) {
      console.error("Error loading exam for edit:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi tải thông tin đề thi.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load questions
  const loadQuestions = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        is_current_user_only: true,
      };

      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim();
        params.content = searchTerm;
        params.tag = searchTerm;
      }

      const response = await getQuestions(params);

      if (response.code === "SUCCESS") {
        // Support response shapes where data is an array or data.rows
        let list = [];
        if (Array.isArray(response.data)) {
          list = response.data;
        } else if (response.data && Array.isArray(response.data.rows)) {
          list = response.data.rows;
        } else if (Array.isArray(response)) {
          list = response;
        }

        const totalItems =
          response.meta?.total_items ??
          (response.data && response.data.count) ??
          (Array.isArray(response.data) ? response.data.length : list.length);

        setQuestions(list || []);
        setPagination((prev) => ({
          ...prev,
          page,
          total: totalItems || 0,
        }));
      }
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Không thể tải danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  // Handle exam info change
  const handleExamInfoChange = (field, value) => {
    setExamInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "search") {
      // Auto search with debounce
      setTimeout(() => loadQuestions(1), 500);
    } else {
      loadQuestions(1);
    }
  };

  // Toggle question selection
  const toggleQuestionSelection = (question) => {
    setExamInfo((prev) => {
      const isSelected = prev.selectedQuestions.some(
        (q) => q.id === question.id
      );

      if (isSelected) {
        // Remove question
        return {
          ...prev,
          selectedQuestions: prev.selectedQuestions.filter(
            (q) => q.id !== question.id
          ),
        };
      } else {
        // Add question with default score
        return {
          ...prev,
          selectedQuestions: [
            ...prev.selectedQuestions,
            {
              id: question.id,
              question: question,
              score: question.score, // Default to original score
            },
          ],
        };
      }
    });
  };

  // Update question score in exam
  const updateQuestionScore = (questionId, newScore) => {
    setExamInfo((prev) => ({
      ...prev,
      selectedQuestions: prev.selectedQuestions.map((q) =>
        q.id === questionId ? { ...q, score: newScore } : q
      ),
    }));
  };

  // Select all visible questions
  const selectAllVisible = () => {
    const newSelections = questions
      .filter((q) => !examInfo.selectedQuestions.some((sq) => sq.id === q.id))
      .map((q) => ({
        id: q.id,
        question: q,
        score: q.score,
      }));

    setExamInfo((prev) => ({
      ...prev,
      selectedQuestions: [...prev.selectedQuestions, ...newSelections],
    }));
  };

  // Deselect all visible questions
  const deselectAllVisible = () => {
    const visibleIds = questions.map((q) => q.id);
    setExamInfo((prev) => ({
      ...prev,
      selectedQuestions: prev.selectedQuestions.filter(
        (q) => !visibleIds.includes(q.id)
      ),
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    loadQuestions(newPage);
  };

  // Save exam
  const saveExam = async () => {
    // Validation
    if (!examInfo.title.trim()) {
      toast.error("Vui lòng nhập tên đề thi");
      return;
    }

    if (!examInfo.startTime) {
      examInfo.startTime = new Date();
    }

    // if (!examInfo.endTime) {
    //   toast.error("Vui lòng chọn thời gian đóng đề");
    //   return;
    // }

    if (
      examInfo.endTime &&
      new Date(examInfo.startTime) >= new Date(examInfo.endTime)
    ) {
      toast.error("Thời gian mở đề phải trước thời gian đóng đề");
      return;
    }

    if (examInfo.selectedQuestions.length === 0) {
      toast.error("Vui lòng chọn ít nhất một câu hỏi");
      return;
    }

    try {
      setLoading(true);

      // Prepare exam data for backend
      const examData = {
        title: examInfo.title.trim(),
        note: examInfo.description.trim() || "", // Note is required but can be empty
        duration: examInfo.timeLimit ? parseInt(examInfo.timeLimit) : 30, // Default 30 if not provided
        earliest_start_time: new Date(examInfo.startTime).toISOString(),
        lastest_start_time: examInfo.endTime
          ? new Date(examInfo.endTime).toISOString()
          : null,
        max_attempt: examInfo.maxAttempts || null,
        is_public:
          examInfo.isPublic === true || examInfo.isPublic === false
            ? examInfo.isPublic
            : true, // Explicitly handle true/false
        list_question: examInfo.selectedQuestions.map((q) => ({
          question_id: parseInt(q.id),
          score: Math.round(q.score), // Convert to integer as required by validator
        })),
      };

      let response;
      if (isEditMode) {
        response = await updateExam(editExamId, examData);
      } else {
        response = await createExam(examData);
      }

      if (response.code === "SUCCESS") {
        toast.success(
          isEditMode ? "Cập nhật đề thi thành công!" : "Tạo đề thi thành công!"
        );

        if (isEditMode) {
          // Reload exam data after update to reflect changes
          await loadExamForEdit(editExamId);
        } else {
          // Reset form only for create mode
          setExamInfo({
            title: "",
            description: "",
            timeLimit: 30,
            startTime: "",
            endTime: "",
            maxAttempts: 1,
            isPublic: true,
            selectedQuestions: [],
          });
        }
        // Optionally redirect to exam bank
        // window.location.href = '/exam-bank';
      }
    } catch (error) {
      console.error("Error creating exam:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Có lỗi xảy ra khi tạo đề thi";

      if (error.response?.data?.errors) {
        // Validation errors from backend
        const validationErrors = error.response.data.errors;
        errorMessage = `Lỗi validation: ${validationErrors
          .map((e) => e.message)
          .join(", ")}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  // Load exam data for edit mode
  useEffect(() => {
    if (isEditMode && editExamId) {
      loadExamForEdit(editExamId);
    }
  }, [isEditMode, editExamId]);

  useEffect(() => {
    loadQuestions();
  }, []);

  const totalPages = Math.ceil(pagination.total / pagination.limit);

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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              {isEditMode ? "Chỉnh sửa đề thi" : "Tạo đề thi mới"}
            </h1>
          </div>

          {/* Exam Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-black mb-4">
              Thông tin đề thi
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Tên đề thi *
                </label>
                <input
                  type="text"
                  value={examInfo.title}
                  onChange={(e) =>
                    handleExamInfoChange("title", e.target.value)
                  }
                  placeholder="Nhập tên đề thi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Thời gian giới hạn (phút)
                </label>
                <input
                  type="number"
                  min="1"
                  value={examInfo.timeLimit}
                  onChange={(e) =>
                    handleExamInfoChange("timeLimit", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Thời gian mở đề
                </label>
                <input
                  type="datetime-local"
                  value={examInfo.startTime}
                  onChange={(e) =>
                    handleExamInfoChange("startTime", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Thời gian đóng đề
                </label>
                <input
                  type="datetime-local"
                  value={examInfo.endTime}
                  onChange={(e) =>
                    handleExamInfoChange("endTime", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Số lượt thi tối đa
                </label>
                <input
                  type="number"
                  min="1"
                  value={examInfo.maxAttempts}
                  onChange={(e) =>
                    handleExamInfoChange(
                      "maxAttempts",
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Mô tả đề thi
              </label>
              <textarea
                value={examInfo.description}
                onChange={(e) =>
                  handleExamInfoChange("description", e.target.value)
                }
                placeholder="Nhập mô tả cho đề thi (tùy chọn)"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500 resize-none"
              />
            </div>

            {/* Public/Private Toggle */}
            <div className="mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={examInfo.isPublic}
                  onChange={(e) =>
                    handleExamInfoChange("isPublic", e.target.checked)
                  }
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-semibold text-black">
                    Công khai đề thi
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    {examInfo.isPublic
                      ? "Đề thi này sẽ hiển thị trong kết quả tìm kiếm cho tất cả người dùng"
                      : "Đề thi này sẽ chỉ hiển thị cho bạn (không xuất hiện trong tìm kiếm)"}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Question Selection */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-black">
                Ngân hàng câu hỏi
              </h2>
              <div className="text-sm text-gray-600">
                Đã chọn: {examInfo.selectedQuestions.length} câu hỏi
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Tìm kiếm câu hỏi
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    placeholder="Nhập để tìm kiếm câu hỏi..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Lọc theo trạng thái
                  </label>
                  <select
                    value={filters.selectedFilter}
                    onChange={(e) =>
                      handleFilterChange("selectedFilter", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium bg-white"
                  >
                    <option value="all">Tất cả câu hỏi</option>
                    <option value="selected">Đã chọn</option>
                    <option value="unselected">Chưa chọn</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={selectAllVisible}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                  >
                    Chọn tất cả
                  </button>
                  <button
                    onClick={deselectAllVisible}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>
              </div>
            </div>

            {/* Questions List */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">Đang tải câu hỏi...</div>
              </div>
            ) : (
              (() => {
                // Apply client-side filter
                let filteredQuestions = questions;
                if (filters.selectedFilter === "selected") {
                  filteredQuestions = questions.filter((q) =>
                    examInfo.selectedQuestions.some((sq) => sq.id === q.id)
                  );
                } else if (filters.selectedFilter === "unselected") {
                  filteredQuestions = questions.filter(
                    (q) =>
                      !examInfo.selectedQuestions.some((sq) => sq.id === q.id)
                  );
                }

                return filteredQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500">
                      {filters.selectedFilter === "selected"
                        ? "Chưa có câu hỏi nào được chọn"
                        : filters.selectedFilter === "unselected"
                        ? "Tất cả câu hỏi đã được chọn"
                        : "Không có câu hỏi nào"}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredQuestions.map((question, index) => {
                      const isSelected = examInfo.selectedQuestions.some(
                        (q) => q.id === question.id
                      );
                      const selectedQuestion = examInfo.selectedQuestions.find(
                        (q) => q.id === question.id
                      );

                      return (
                        <div
                          key={question.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                        >
                          <div className="flex items-start gap-4">
                            {/* checkbox */}
                            <div className="flex-shrink-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  toggleQuestionSelection(question)
                                }
                                className="mt-2 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                aria-label={`Chọn câu ${index + 1}`}
                              />
                            </div>

                            {/* content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1 flex-wrap">
                                <span className="font-semibold text-black">
                                  Câu{" "}
                                  {(pagination.page - 1) * pagination.limit +
                                    index +
                                    1}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                  {QuestionTypes[question.type]?.label ||
                                    QuestionTypes[question.type] ||
                                    "Khác"}{" "}
                                </span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                  {question.score} điểm gốc
                                </span>
                                {question.tags && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                    {question.tags}
                                  </span>
                                )}
                              </div>

                              <h3 className="text-lg font-medium text-black mb-2 truncate">
                                {question.content}
                              </h3>

                              {question.description && (
                                <p className="text-gray-600 text-sm mb-3">
                                  {question.description}
                                </p>
                              )}

                              {question.choices &&
                                question.choices.length > 0 && (
                                  <div className="grid sm:grid-cols-2 gap-2 mb-3">
                                    {question.choices.map(
                                      (choice, choiceIndex) => (
                                        <div
                                          key={choice.id}
                                          className={`p-2 rounded border text-sm ${
                                            choice.is_correct
                                              ? "bg-green-50 border-green-200 text-green-800"
                                              : "bg-gray-50 border-gray-200 text-gray-700"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            {choice.is_correct && (
                                              <span className="text-green-600">
                                                ✓
                                              </span>
                                            )}
                                            <span className="font-medium w-5">
                                              {String.fromCharCode(
                                                65 + choiceIndex
                                              )}
                                              .
                                            </span>
                                            <span className="truncate">
                                              {choice.content}
                                            </span>
                                          </div>
                                          {choice.explanation && (
                                            <div className="text-xs text-gray-600 italic mt-1">
                                              Giải thích: {choice.explanation}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}

                              {/* meta row */}
                              <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                  {question.creator && (
                                    <>
                                      <span className="font-medium text-gray-700">
                                        {question.creator.username}
                                      </span>
                                      <span>•</span>
                                      <span>
                                        {new Date(
                                          question.created_at
                                        ).toLocaleDateString("vi-VN")}
                                      </span>
                                    </>
                                  )}
                                </div>

                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() => {}}
                                    className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition"
                                  >
                                    <ChatBubbleLeftIcon className="w-4 h-4" />
                                    <span className="text-sm">
                                      {question.comment_count ?? 0}
                                    </span>
                                  </button>
                                  <div className="flex items-center gap-1 text-yellow-500">
                                    <StarIcon className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm text-gray-700">
                                      {question.average_rating != null
                                        ? Number(
                                            question.average_rating
                                          ).toFixed(1)
                                        : "-"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* score input */}
                            {isSelected && (
                              <div className="ml-4">
                                <label className="block text-xs font-medium text-black mb-1">
                                  Điểm trong bài thi
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="1"
                                  value={
                                    selectedQuestion?.score || question.score
                                  }
                                  onChange={(e) =>
                                    updateQuestionScore(
                                      question.id,
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-black bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Trước
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 border rounded-lg transition ${
                          pageNum === pagination.page
                            ? "bg-blue-500 text-white border-blue-500"
                            : "border-gray-300 text-black bg-white hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-black bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Sau
                </button>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              Hủy
            </button>
            <button
              onClick={saveExam}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium shadow-md"
            >
              {isEditMode ? "Cập nhật đề thi" : "Lưu đề thi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;
