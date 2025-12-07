import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import SidebarMenu from '../components/SidebarMenu';
import { getExamAttemptResult } from '../api/examAttemptApi';

const ExamResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.user.currentUser);
  const attemptId = searchParams.get('attempt_id');

  const [examResult, setExamResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResult = async () => {
      if (!attemptId) {
        toast.error('Không tìm thấy kết quả bài thi');
        navigate('/exam-bank');
        return;
      }

      try {
        setLoading(true);
        const response = await getExamAttemptResult(parseInt(attemptId));
        
        if (response.code === 'SUCCESS') {
          setExamResult(response.data);
        }
      } catch (error) {
        console.error('Error loading exam result:', error);
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải kết quả';
        toast.error(errorMessage);
        navigate('/exam-bank');
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [attemptId, navigate]);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    const displayHours = date.getHours() % 12 || 12;
    return `${day}/${month}/${year}, ${displayHours}:${minutes}:${seconds} ${ampm}`;
  };

  // Check if user can review exam (user who submitted can always review, or exam is closed, or user is creator)
  const canReviewExam = () => {
    if (!examResult || !examResult.exam) return false;
    
    // If user is the creator of the exam
    if (examResult.exam.creator_id && currentUser && examResult.exam.creator_id === currentUser.id) {
      return true;
    }
    
    // If exam attempt has finished_at, user can review their own submission
    if (examResult.finished_at && examResult.user_id && currentUser && examResult.user_id === currentUser.id) {
      return true;
    }
    
    // Check if exam is closed (lastest_start_time has passed)
    if (examResult.finished_at && examResult.exam.lastest_start_time) {
      const now = new Date();
      const lastestStartTime = new Date(examResult.exam.lastest_start_time);
      if (now >= lastestStartTime) {
        return true;
      }
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="flex gap-4 bg-gray-100 min-h-screen p-4">
        <div className="w-96">
          <SidebarMenu />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600 text-xl">Đang tải kết quả...</div>
        </div>
      </div>
    );
  }

  if (!examResult) {
    return (
      <div className="flex gap-4 bg-gray-100 min-h-screen p-4">
        <div className="w-96">
          <SidebarMenu />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600 text-xl">Không tìm thấy kết quả</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 bg-gray-100 min-h-screen p-4">
      {/* Sidebar */}
      <div className="w-96">
        <SidebarMenu />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-lg p-8" style={{ minHeight: 'calc(100vh - 32px)' }}>
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Kết Quả Bài Thi</h1>
            <div className="space-y-1">
              <p className="text-gray-600 text-lg">
                Chúc mừng! Bạn đã hoàn thành bài thi
              </p>
              <p className="text-gray-800 font-semibold text-xl">
                "{examResult.exam?.title || 'Đề thi'}"
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Statistics */}
            <div className="lg:col-span-2 space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <p className="text-gray-600 text-sm mb-1">Tổng số câu</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {examResult.total_question || 0}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-gray-600 text-sm mb-1">Câu đúng</p>
                  <p className="text-2xl font-bold text-green-700">
                    {examResult.correct_question || 0}
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-gray-600 text-sm mb-1">Câu sai</p>
                  <p className="text-2xl font-bold text-red-700">
                    {examResult.wrong_question || 0}
                  </p>
                </div>
              </div>

              {/* Time Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h3 className="text-gray-700 font-semibold mb-3">Thông tin thời gian</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Thời gian bắt đầu:</span>
                    <span className="text-gray-800 font-medium">
                      {formatDateTime(examResult.started_at)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Thời gian nộp bài:</span>
                    <span className="text-gray-800 font-medium">
                      {formatDateTime(examResult.finished_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Score Card */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-xl h-full flex flex-col justify-center">
                <div className="text-center">
                  <p className="text-green-100 text-sm mb-3 font-medium">Điểm số của bạn</p>
                  <div className="flex items-baseline justify-center gap-2">
                    {examResult.score !== null && examResult.score !== undefined ? (
                      <>
                        <span className="text-5xl font-bold text-white">
                          {examResult.score.toFixed(1)}
                        </span>
                        {examResult.total_score && (
                          <span className="text-3xl font-semibold text-green-100">
                            /{examResult.total_score.toFixed(1)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-5xl font-bold text-green-100">--</span>
                    )}
                  </div>
                  {/* Score Percentage */}
                  {examResult.score !== null && examResult.score !== undefined && examResult.total_score && (
                    <div className="mt-4">
                      <div className="bg-green-600/30 rounded-full h-2 mb-2">
                        <div
                          className="bg-white rounded-full h-2 transition-all duration-500"
                          style={{
                            width: `${(examResult.score / examResult.total_score) * 100}%`
                          }}
                        ></div>
                      </div>
                      <p className="text-green-100 text-sm">
                        Đạt {((examResult.score / examResult.total_score) * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            {canReviewExam() && (
              <button
                onClick={() => {
                  navigate(`/exam-review?attempt_id=${attemptId}`);
                }}
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Xem lại Bài làm
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-lg font-medium transition shadow-sm hover:shadow-md"
            >
              Quay về Trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamResult;

