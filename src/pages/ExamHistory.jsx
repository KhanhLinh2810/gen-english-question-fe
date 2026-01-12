import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SidebarMenu from "../components/SidebarMenu";
import ConfirmModal from "../components/ConfirmModal";
import { getExamAttempts, deleteExamAttempt } from "../api/examAttemptApi";

const ExamHistory = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    attemptId: null,
    attemptTitle: "",
  });

  useEffect(() => {
    loadAttempts();
  }, [pagination.page]);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      const response = await getExamAttempts({
        page: pagination.page,
        limit: pagination.limit,
        is_current_user_only: true,
        sortBy: "created_at",
        sortOrder: "DESC",
      });

      if (response.code === "SUCCESS") {
        // Backend returns data directly (array), not data.rows
        const attemptsData = Array.isArray(response.data) ? response.data : [];
        setAttempts(attemptsData);
        setPagination((prev) => ({
          ...prev,
          total: response.meta?.total_items || 0,
        }));
      }
    } catch (error) {
      console.error("Error loading exam attempts:", error);
      toast.error("Có lỗi xảy ra khi tải lịch sử làm bài");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.attemptId) return;

    try {
      setLoading(true);
      const response = await deleteExamAttempt(deleteModal.attemptId);

      if (response.code === "SUCCESS") {
        toast.success("Xóa bài làm thành công");
        setDeleteModal({ show: false, attemptId: null, attemptTitle: "" });
        await loadAttempts(); // Reload danh sách sau khi xóa
      } else {
        toast.error(response.message || "Có lỗi xảy ra khi xóa bài làm");
      }
    } catch (error) {
      console.error("Error deleting exam attempt:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi xóa bài làm";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    const displayHours = date.getHours() % 12 || 12;
    return `${day}/${month}/${year}, ${displayHours}:${minutes}:${seconds} ${ampm}`;
  };

  const getStatusBadge = (attempt) => {
    if (attempt.finished_at) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          Đã hoàn thành
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
        Đang làm
      </span>
    );
  };

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
          className="bg-white rounded-2xl shadow-lg p-6"
          style={{ minHeight: "calc(100vh - 32px)" }}
        >
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              Lịch sử làm bài
            </h1>
            <p className="text-gray-600">
              Danh sách tất cả các bài thi bạn đã làm
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600 text-lg">Đang tải...</div>
            </div>
          ) : attempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <p className="text-gray-600 text-lg">Chưa có bài làm nào</p>
            </div>
          ) : (
            <>
              {/* Attempts List */}
              <div className="space-y-4 mb-6">
                {attempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-start justify-between">
                      {/* Left: Exam Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {attempt.exam?.title || "Đề thi không xác định"}
                          </h3>
                          {getStatusBadge(attempt)}
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          {attempt.finished_at &&
                            attempt.score !== null &&
                            attempt.score !== undefined && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Điểm số
                                </p>
                                <p className="text-sm font-semibold text-blue-600">
                                  {attempt.score.toFixed(1)}
                                  {(() => {
                                    // show max score: prefer total_score, fallback to total_question
                                    const max =
                                      attempt.exam.max_score.toFixed(1) ??
                                      attempt.total_question ??
                                      null;
                                    if (max === null || max === undefined)
                                      return "";
                                    // if numeric, format with one decimal when appropriate
                                    if (typeof max === "number") {
                                      return ` / ${
                                        max % 1 === 0 ? max : max.toFixed(1)
                                      }`;
                                    }
                                    return ` / ${max}`;
                                  })()}
                                </p>
                              </div>
                            )}
                          {attempt.finished_at && (
                            <>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Câu đúng
                                </p>
                                <p className="text-sm font-semibold text-green-600">
                                  {attempt.correct_question || 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Câu sai
                                </p>
                                <p className="text-sm font-semibold text-red-600">
                                  {attempt.wrong_question || 0}
                                </p>
                              </div>
                            </>
                          )}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Thời gian làm
                            </p>
                            <p className="text-sm font-medium text-gray-700">
                              {attempt.duration} phút
                            </p>
                          </div>
                        </div>

                        {/* Time Info */}
                        <div className="mt-3 space-y-1">
                          <p className="text-xs text-gray-500">
                            Bắt đầu: {formatDateTime(attempt.started_at)}
                          </p>
                          {attempt.finished_at && (
                            <p className="text-xs text-gray-500">
                              Nộp bài: {formatDateTime(attempt.finished_at)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-2 ml-4">
                        {attempt.finished_at ? (
                          <button
                            onClick={() =>
                              navigate(`/exam-result?attempt_id=${attempt.id}`)
                            }
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition shadow-sm"
                          >
                            Xem chi tiết
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              navigate(`/take-exam?exam_id=${attempt.exam_id}`)
                            }
                            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition shadow-sm"
                          >
                            Tiếp tục làm
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Trang {pagination.page} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    disabled={pagination.page >= totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.show}
        onClose={() =>
          setDeleteModal({ show: false, attemptId: null, attemptTitle: "" })
        }
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa bài làm "${deleteModal.attemptTitle}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

export default ExamHistory;
