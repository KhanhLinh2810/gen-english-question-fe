import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SidebarMenu from "../components/SidebarMenu";
import { getExamAttempts } from "../api/examAttemptApi";
import { getExams } from "../api/examApi";
import {
  PencilSquareIcon,
  BookOpenIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const HomePage = () => {
  const navigate = useNavigate();
  const [recentExams, setRecentExams] = useState([]);
  const [suggestedExams, setSuggestedExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load recent exam attempts (last 5)
      const attemptsResponse = await getExamAttempts({
        page: 1,
        limit: 5,
        is_current_user_only: true,
        sortBy: "created_at",
        sortOrder: "DESC",
      });

      if (attemptsResponse.code === "SUCCESS") {
        const attemptsData = Array.isArray(attemptsResponse.data)
          ? attemptsResponse.data
          : [];
        setRecentExams(
          attemptsData.map((attempt) => ({
            id: attempt.id,
            exam_id: attempt.exam_id,
            name: attempt.exam?.title || "Đề thi không xác định",
            date: attempt.finished_at
              ? new Date(attempt.finished_at).toLocaleDateString("vi-VN")
              : new Date(attempt.started_at).toLocaleDateString("vi-VN"),
            score:
              attempt.finished_at &&
              attempt.score !== null &&
              attempt.score !== undefined
                ? `${attempt.score.toFixed(1)}${
                    attempt.total_question
                      ? `/${attempt.exam?.max_score.toFixed(1) ?? attempt.total_question}`
                      : ""
                  }`
                : "-",
            status: attempt.finished_at ? "Hoàn thành" : "Đang làm",
            finished: !!attempt.finished_at,
          })),
        );
      }

      // Load user's exams (suggested - public or own exams)
      const examsResponse = await getExams({
        page: 1,
        limit: 3,
        is_current_user_only: false, // Show public exams and own exams
      });

      if (examsResponse.code === "SUCCESS") {
        const examsData = Array.isArray(examsResponse.data)
          ? examsResponse.data
          : [];
        setSuggestedExams(
          examsData.map((exam) => ({
            id: exam.id,
            name: exam.title || "Đề thi không xác định",
            progress: 0, // Can calculate based on attempts if needed
          })),
        );
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải dữ liệu trang chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = (attemptId, finished, examId) => {
    if (finished) {
      navigate(`/exam-result?attempt_id=${attemptId}`);
    } else {
      navigate(`/take-exam?exam_id=${examId}`);
    }
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
          {/* Top Header with User Info */}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-0 leading-tight">
                Trang chủ
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Tổng quan và các tác vụ nhanh
              </p>
            </div>
          </div>

          {/* Features Grid - 2x2 layout */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Tạo đề thi */}
            <div
              onClick={() => navigate("/CreateExam")}
              className={`group cursor-pointer p-6 rounded-xl min-h-[112px]
                bg-gradient-to-br from-[#2D3E83] to-[#1E40AF]
                text-white
                border border-white/10
                shadow-md
                transition-all duration-200
                hover:-translate-y-0.5 hover:shadow-lg
              `}
            >
              <PencilSquareIcon className="h-8 w-8 mb-3 text-blue-200 group-hover:scale-105 transition" />
              <h2 className="text-lg font-semibold mb-1">Tạo đề thi mới</h2>
              <p className="text-slate-100 text-sm">
                Tạo đề thi mới từ ngân hàng câu hỏi
              </p>
            </div>

            {/* Tạo câu hỏi thủ công */}
            <div
              onClick={() => navigate("/exam-bank")}
              className={`group cursor-pointer p-6 rounded-xl min-h-[112px]
                bg-gradient-to-br from-[#2D3E83] to-[#0EA5A3]
                text-white
                border border-white/10
                shadow-md
                transition-all duration-200
                hover:-translate-y-0.5 hover:shadow-lg
              `}
            >
              <PencilIcon className="h-8 w-8 mb-3 text-sky-200 group-hover:scale-105 transition" />
              <h2 className="text-lg font-semibold mb-1">
                Tạo câu hỏi thủ công
              </h2>
              <p className="text-cyan-100 text-sm">Tạo câu hỏi mới</p>
            </div>

            {/* Ngân hàng câu hỏi */}
            <div
              onClick={() => navigate("/questions")}
              className={`group cursor-pointer p-6 rounded-xl min-h-[112px]
                bg-gradient-to-br from-[#2D3E83] to-[#3B5AB0]
                text-white
                border border-white/10
                shadow-md
                transition-all duration-200
                hover:-translate-y-0.5 hover:shadow-lg
              `}
            >
              <BookOpenIcon className="h-8 w-8 mb-3 text-cyan-200 group-hover:scale-105 transition" />
              <h2 className="text-lg font-semibold mb-1">Ngân hàng câu hỏi</h2>
              <p className="text-slate-100 text-sm">
                Xem và quản lý kho câu hỏi của bạn
              </p>
            </div>

            {/* Ngân hàng đề thi */}
            <div
              onClick={() => navigate("/exam-bank")}
              className={`group cursor-pointer p-6 rounded-xl min-h-[112px]
                bg-gradient-to-br from-[#2D3E83] to-[#5B21B6]
                text-white
                border border-white/10
                shadow-md
                transition-all duration-200
                hover:-translate-y-0.5 hover:shadow-lg
              `}
            >
              <ClipboardDocumentListIcon className="h-8 w-8 mb-3 text-indigo-200 group-hover:scale-105 transition" />
              <h2 className="text-lg font-semibold mb-1">Ngân hàng đề thi</h2>
              <p className="text-indigo-100 text-sm">
                Xem và quản lý các đề thi
              </p>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Lịch sử làm bài gần đây
            </h2>
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
                Đang tải...
              </div>
            ) : recentExams.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
                Chưa có bài làm nào
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-700 font-medium">
                        Tên bài thi
                      </th>
                      <th className="px-4 py-3 text-left text-gray-700 font-medium">
                        Ngày thi
                      </th>
                      <th className="px-4 py-3 text-left text-gray-700 font-medium">
                        Điểm số
                      </th>
                      <th className="px-4 py-3 text-left text-gray-700 font-medium">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-gray-700 font-medium">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExams.map((exam) => (
                      <tr key={exam.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800">{exam.name}</td>
                        <td className="px-4 py-3 text-gray-600">{exam.date}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {exam.score}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              exam.finished
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {exam.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() =>
                              handleViewResult(
                                exam.id,
                                exam.finished,
                                exam.exam_id,
                              )
                            }
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            {exam.finished ? "Xem kết quả" : "Tiếp tục"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Suggested Exams Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Đề thi gợi ý
            </h2>
            {loading ? (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-3"></div>
                      <div className="h-2 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestedExams.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
                Chưa có đề thi nào
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {suggestedExams.map((exam) => (
                  <div
                    key={exam.id}
                    onClick={() => navigate(`/exam-bank`)}
                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow transition cursor-pointer"
                  >
                    <h3 className="text-sm font-medium text-gray-800 mb-3">
                      {exam.name}
                    </h3>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${exam.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {exam.progress}% hoàn thành
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>{" "}
        {/* End bg-white rounded container */}
      </div>{" "}
      {/* End flex-1 */}
    </div> // End flex
  );
};

export default HomePage;
