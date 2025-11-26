import React, { useState } from 'react';
import SidebarMenu from '../components/SidebarMenu';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('recent');

  const recentExams = [
    { id: 1, name: 'TOEIC Practice Test 1', date: '20/05/2024', score: '850/990', status: 'Hoàn thành', action: 'Xem lại' },
    { id: 2, name: 'Midterm English Exam', date: '15/05/2024', score: '75/100', status: 'Đã chấm', action: 'Xem lại' },
    { id: 3, name: 'Grammar Quiz - Unit 5', date: '10/05/2024', score: '60/100', status: 'Chưa đặt', action: 'Xem lại' },
  ];

  const suggestedExams = [
    { id: 1, name: 'Final Exam B1 Level', progress: 30 },
    { id: 2, name: 'IELTS IELTS Writing Task 2', progress: 50 },
    { id: 3, name: 'Speaking Fluency Test', progress: 0 },
  ];

  return (
    <div className="flex gap-4 bg-gray-100 min-h-screen p-4">
      {/* Sidebar */}
      <div className="w-96">
        <SidebarMenu />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white rounded-2xl shadow-sm p-6" style={{minHeight: 'calc(100vh - 32px)'}}>
          {/* Top Header with User Info */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Trang chủ</h1>
              <p className="text-gray-600 text-sm">Chức năng truy cập nhanh</p>
            </div>
          </div>

        {/* Features Grid - 2x2 layout */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Feature Cards */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <div className="text-2xl mb-3">📝</div>
            <h2 className="text-lg font-semibold mb-1">Tạo bài thi mới</h2>
            <p className="text-blue-100 text-sm">Tạo bài thi mới từ ngân hàng câu hỏi</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <div className="text-2xl mb-3">📚</div>
            <h2 className="text-lg font-semibold mb-1">Ngân hàng câu hỏi</h2>
            <p className="text-cyan-100 text-sm">Xem và quản lý kho câu hỏi của bạn</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <div className="text-2xl mb-3">📊</div>
            <h2 className="text-lg font-semibold mb-1">Danh sách bài thi</h2>
            <p className="text-cyan-100 text-sm">Quản lý các bài thi của bạn</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <div className="text-2xl mb-3">🔍</div>
            <h2 className="text-lg font-semibold mb-1">Tìm kiếm bài thi</h2>
            <p className="text-blue-100 text-sm">Tìm và tham gia các bài thi khác</p>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Lịch sử truy cập gần đây</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700 font-medium">Tên bài thi</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-medium">Ngày thi</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-medium">Điểm số</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {recentExams.map((exam) => (
                  <tr key={exam.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{exam.name}</td>
                    <td className="px-4 py-3 text-gray-600">{exam.date}</td>
                    <td className="px-4 py-3 text-gray-600">{exam.score}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">{exam.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">{exam.action}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Suggested Exams Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Bài kiểm tra của tôi đã gợi ý</h2>
          <div className="grid grid-cols-3 gap-4">
            {suggestedExams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow transition">
                <h3 className="text-sm font-medium text-gray-800 mb-3">{exam.name}</h3>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${exam.progress}%` }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">{exam.progress}% hoàn thành</p>
              </div>
            ))}
          </div>
        </div>
        </div> {/* End bg-white rounded container */}
      </div> {/* End flex-1 */}
    </div> // End flex
  );
};

export default HomePage;
