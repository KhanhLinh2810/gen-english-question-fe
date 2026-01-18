import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
} from "recharts";
import {
  UserCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import {
  getExamAttempts,
  exportExcelExamAttempts,
} from "../api/examAttemptApi";
import { useNavigate } from "react-router-dom";

const ExamDetailView = ({ exam, onBack }) => {
  if (!exam) return null;
  const [recentExams, setRecentExams] = useState([]);
  const [averageScore, setAverageScore] = useState("0.0");
  const navigate = useNavigate();

  const [chartData, setChartData] = useState([]);
  useEffect(() => {
    const fetchExamAttempts = async () => {
      try {
        const attemptsResponse = await getExamAttempts({
          page: 1,
          limit: 100,
          exam_id: exam.id,
          sortBy: "created_at",
          sortOrder: "DESC",
        });

        if (attemptsResponse.code === "SUCCESS") {
          const attemptsData = Array.isArray(attemptsResponse.data)
            ? attemptsResponse.data
            : [];

          setRecentExams(
            attemptsData.slice(0, 10).map((attempt) => ({
              id: attempt.id,
              exam_id: attempt.exam_id,
              username: attempt.user?.username || "Người dùng ẩn danh",
              started_at: new Date(attempt.started_at).toLocaleString("vi-VN"),
              finished_at: attempt.finished_at
                ? new Date(attempt.finished_at).toLocaleString("vi-VN")
                : "-",
              score:
                attempt.finished_at && attempt.score != null
                  ? Number(attempt.score).toFixed(1)
                  : "-",
              status: attempt.finished_at ? "Hoàn thành" : "Đang làm",
              finished: !!attempt.finished_at,
            })),
          );

          // 2. Lọc dữ liệu sạch để tính toán biểu đồ & điểm trung bình
          const finishedExams = attemptsData.filter(
            (item) =>
              item.finished_at &&
              item.score !== null &&
              !isNaN(parseFloat(item.score)),
          );

          // 3. Tính phân bổ điểm số (Trục X: Điểm, Trục Y: Số lượng)
          const distribution = finishedExams.reduce((acc, curr) => {
            const scoreLabel = Number(curr.score).toFixed(1);
            acc[scoreLabel] = (acc[scoreLabel] || 0) + 1;
            return acc;
          }, {});

          const sortedDist = Object.keys(distribution)
            .map((score) => ({
              score: parseFloat(score),
              count: distribution[score],
            }))
            .sort((a, b) => a.score - b.score);

          setChartData(sortedDist);

          // 4. Tính điểm trung bình
          const totalScore = finishedExams.reduce(
            (sum, item) => sum + parseFloat(item.score),
            0,
          );
          setAverageScore(
            finishedExams.length > 0
              ? (totalScore / finishedExams.length).toFixed(1)
              : "0.0",
          );
        }
      } catch (error) {
        toast.error("Không thể tải lịch sử làm bài.");
      }
    };
    fetchExamAttempts();
  }, [exam.id]);

  const handleViewResult = (attemptId, finished) => {
    if (finished) {
      navigate(`/exam-result?attempt_id=${attemptId}`);
    } else {
      toast.error("Bài thi chưa hoàn thành. Vui lòng quay lại sau.");
    }
  };

  const exportExcel = async () => {
    try {
      await exportExcelExamAttempts({
        page: 1,
        limit: 5,
        exam_id: exam.id,
        sortBy: "created_at",
        sortOrder: "DESC",
      });
    } catch (error) {
      toast.error("Xuất báo cáo thất bại. Vui lòng thử lại.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Không giới hạn";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    const displayHours = date.getHours() % 12 || 12;
    return `${day}/${month}/${year}, ${displayHours}:${minutes} ${ampm}`;
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm p-6"
      style={{ minHeight: "calc(100vh - 32px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">
            Chi tiết đề thi
          </h1>
        </div>
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition font-medium"
        >
          ← Quay lại
        </button>
      </div>

      {/* Exam Title */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white mb-6">
        <h2 className="text-2xl font-bold mb-2">{exam.title}</h2>
      </div>

      {/* Exam Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCircleIcon className="text-blue-600 text-xl w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Tác giả:</p>
              <p className="font-semibold text-gray-800">
                {exam.creator?.username || "Hệ thống"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <ClipboardDocumentListIcon className="text-green-600 text-xl w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Số lượng câu hỏi:</p>
              <p className="font-semibold text-gray-800">
                {exam.list_question?.length || exam.total_question || 0} câu
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <ClockIcon className="text-purple-600 text-xl w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Thời gian thi:</p>
              <p className="font-semibold text-gray-800">
                {exam.duration} phút
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Time and Limit Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Giới hạn</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">●</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Thời gian mở đề:</p>
              <p className="font-medium text-gray-800">
                {formatDate(exam.earliest_start_time)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm">●</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Thời gian đóng đề:</p>
              <p className="font-medium text-gray-800">
                {formatDate(exam.lastest_start_time)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <UsersIcon className="text-blue-600 text-sm w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Số lượng thi tốt đa:</p>
              <p className="font-medium text-gray-800">
                {exam.max_attempt
                  ? `${exam.max_attempt} lượt`
                  : "Không giới hạn"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Note from creator - Warning box */}
      {exam.note && (
        <div className="mb-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-yellow-600 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                  CHÚ THÍCH:
                </h3>
                <p className="text-sm text-yellow-700">{exam.note}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creator Info */}
      {exam.creator && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <img
              src={
                exam.creator.avatar_url || "../../src/assets/default-avatar.png"
              }
              alt="Creator Avatar"
              className="w-8 h-8 rounded-full"
            />
            <div>
              <span className="font-medium">
                Tạo bởi: {exam.creator.username}
              </span>
              <span className="mx-2">•</span>
              <span>
                {new Date(exam.created_at).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Start Exam Button */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
        <button
          onClick={() => {
            // Navigate to take exam page
            window.location.href = `/take-exam?exam_id=${exam.id}`;
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transition flex items-center gap-2"
        >
          <span>Bắt đầu làm bài</span>
        </button>
      </div>

      {/* Recent Activity Section */}
      {recentExams.length !== 0 && (
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Phân bổ điểm số
              </h3>
              <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                <span className="text-sm text-blue-600 font-medium">
                  Điểm trung bình:{" "}
                </span>
                <span className="text-xl font-bold text-blue-700">
                  {averageScore}
                </span>
              </div>
            </div>

            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="score"
                    label={{ value: "Điểm số", position: "bottom", offset: 0 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    label={{
                      value: "Số lượng thí sinh",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f3f4f6" }}
                    formatter={(value) => [`${value} thí sinh`, "Số lượng"]}
                    labelFormatter={(label) => `Điểm: ${label}`}
                  />

                  {/* Đường kẻ hiển thị Điểm trung bình */}
                  <ReferenceLine
                    x={parseFloat(averageScore)}
                    stroke="red"
                    strokeDasharray="5 5"
                    label={{
                      position: "top",
                      value: `TB: ${averageScore}`,
                      fill: "red",
                      fontSize: 12,
                    }}
                  />

                  <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  >
                    <LabelList dataKey="count" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Lịch sử làm bài gần đây
          </h2>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700 font-medium">
                    Thí sinh
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 font-medium">
                    Bắt đầu
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 font-medium">
                    Kết thúc
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
                    <td className="px-4 py-3 text-gray-800">{exam.username}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {exam.started_at}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {exam.finished_at}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{exam.score}</td>
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
                          handleViewResult(exam.id, exam.finished, exam.exam_id)
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

          {/* export Button */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
            <button
              onClick={exportExcel}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transition flex items-center gap-2"
            >
              <span>Xuất báo cáo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamDetailView;
