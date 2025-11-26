import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import SidebarMenu from '../components/SidebarMenu';
import ConfirmModal from '../components/ConfirmModal';
import ExamDetailView from '../components/ExamDetailView';
import { getExams, getExamDetail, deleteExam } from '../api/examApi';

const ExamBank = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to format datetime for datetime-local input
  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const [filters, setFilters] = useState({
    search: '', // Combined search for title and creator name
    duration_from: '',
    duration_to: '',
    earliest_start_time: '', // Single datetime for earliest start time overlap
    lastest_start_time: '', // Single datetime for latest start time overlap
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalItems: 0,
    totalPages: 0,
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'default'
  });
  const [currentView, setCurrentView] = useState('list'); // 'list', 'detail', 'edit'
  const [selectedExam, setSelectedExam] = useState(null);

  const searchTimeoutRef = useRef(null);

  const loadExams = async (page = pagination.page) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        is_current_user_only: true, // Always show current user's exams
      };

      // Only add search param if it has meaningful content
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }

      // Only add duration params if they are valid numbers
      if (filters.duration_from && filters.duration_from.trim() && !isNaN(parseInt(filters.duration_from.trim()))) {
        params.duration_from = parseInt(filters.duration_from.trim());
      }

      if (filters.duration_to && filters.duration_to.trim() && !isNaN(parseInt(filters.duration_to.trim()))) {
        params.duration_to = parseInt(filters.duration_to.trim());
      }

      // Only add datetime params if they are valid dates
      if (filters.earliest_start_time && filters.earliest_start_time.trim()) {
        try {
          const date = new Date(filters.earliest_start_time.trim());
          if (!isNaN(date.getTime())) {
            params.earliest_start_time = date.toISOString();
          }
        } catch (e) {
          console.warn('Invalid earliest_start_time:', filters.earliest_start_time);
        }
      }

      if (filters.lastest_start_time && filters.lastest_start_time.trim()) {
        try {
          const date = new Date(filters.lastest_start_time.trim());
          if (!isNaN(date.getTime())) {
            params.lastest_start_time = date.toISOString();
          }
        } catch (e) {
          console.warn('Invalid lastest_start_time:', filters.lastest_start_time);
        }
      }

      const response = await getExams(params);
      
      if (response.code === 'SUCCESS') {
        // Backend returns data directly (not data.rows)
        const examsData = Array.isArray(response.data) ? response.data : [];
        setExams(examsData);
        setPagination(prev => ({
          ...prev,
          page: response.meta?.page || 1,
          totalItems: response.meta?.total_items || 0,
          totalPages: response.meta?.total_pages || 0,
        }));
      } else {
        toast.error(response.message || 'Không thể tải danh sách đề thi.');
      }
    } catch (error) {
      console.error('Error loading exams:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách đề thi.';
      toast.error(errorMessage);
      setExams([]); // Ensure exams is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    
    // Validate time ranges only if both values are provided and not empty
    const newFilters = { ...filters, [name]: value };
    
    // Validate duration range
    if (name === 'duration_from' || name === 'duration_to') {
      const fromStr = newFilters.duration_from?.trim();
      const toStr = newFilters.duration_to?.trim();
      if (fromStr && toStr) {
        const from = parseInt(fromStr);
        const to = parseInt(toStr);
        if (!isNaN(from) && !isNaN(to) && from > to) {
          toast.error('Thời gian thi "Từ" phải nhỏ hơn hoặc bằng "Đến"');
          return;
        }
      }
    }
    
    // No need for datetime validation since we only have single datetime inputs now
    
    // No automatic search - only update state
  };

  // Manual search function
  const handleSearch = () => {
    loadExams(1); // Reset to page 1 and search with current filters
  };

  const handleDeleteClick = (examId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa đề thi',
      message: 'Bạn có chắc chắn muốn xóa đề thi này? Hành động này không thể hoàn tác.',
      onConfirm: async () => {
        try {
          setLoading(true);
          const response = await deleteExam(examId);
          if (response.code === 'SUCCESS') {
            toast.success('Xóa đề thi thành công!');
            loadExams();
          } else {
            toast.error(response.message || 'Xóa đề thi thất bại.');
          }
        } catch (error) {
          console.error('Error deleting exam:', error);
          const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa đề thi.';
          toast.error(errorMessage);
        } finally {
          setLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      },
      type: 'danger'
    });
  };

  const handleViewDetail = async (examId) => {
    try {
      setLoading(true);
      const response = await getExamDetail(examId);
      if (response.code === 'SUCCESS') {
        setSelectedExam(response.data);
        setCurrentView('detail');
      }
    } catch (error) {
      console.error('Error loading exam detail:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tải chi tiết đề thi.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (examId) => {
    // Navigate to edit exam page with edit parameter
    window.location.href = `/CreateExam?edit=${examId}`;
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedExam(null);
    loadExams(); // Reload list
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      loadExams(newPage);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 })); // Reset to page 1
    // loadExams will be called by useEffect due to pagination.limit change
  };

  // Load initial data without filters
  useEffect(() => {
    loadExams();
  }, []);

  return (
    <div className="flex gap-4 bg-gray-100 min-h-screen p-4">
      {/* Sidebar */}
      <div className="w-96">
        <SidebarMenu />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {currentView === 'detail' && selectedExam ? (
          <ExamDetailView 
            exam={selectedExam} 
            onBack={handleBackToList}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6" style={{ minHeight: 'calc(100vh - 32px)' }}>
            <h1 className="text-2xl font-bold text-black mb-6">Ngân hàng đề thi</h1>

        {/* Filters and Create New */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-4 mb-4">
            {/* Search Filter */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Tìm kiếm theo tên đề thi hoặc người tạo</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Nhập tên đề thi hoặc tên người tạo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
              />
            </div>
            
            {/* Duration Range Filter */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Thời gian thi (phút)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={filters.duration_from}
                  onChange={(e) => handleFilterChange('duration_from', e.target.value)}
                  placeholder="Từ (phút)..."
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
                />
                <input
                  type="number"
                  value={filters.duration_to}
                  onChange={(e) => handleFilterChange('duration_to', e.target.value)}
                  placeholder="Đến (phút)..."
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
                />
              </div>
            </div>
            
            {/* Earliest Start Time Filter */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Thời gian mở đề</label>
              <input
                type="datetime-local"
                value={filters.earliest_start_time}
                onChange={(e) => handleFilterChange('earliest_start_time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
              />
            </div>
            
            {/* Latest Start Time Filter */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">Thời gian đóng đề</label>
              <input
                type="datetime-local"
                value={filters.lastest_start_time}
                onChange={(e) => handleFilterChange('lastest_start_time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-medium shadow-md"
              >
                Tìm kiếm
              </button>
              <button
                onClick={() => {
                  setFilters({
                    search: '',
                    duration_from: '',
                    duration_to: '',
                    earliest_start_time: '',
                    lastest_start_time: '',
                  });
                  setTimeout(() => loadExams(1), 100);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition font-medium"
              >
                Xóa bộ lọc
              </button>
            </div>
            
            <Link
              to="/CreateExam"
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition font-medium shadow-md"
            >
              Tạo đề thi mới
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-black text-lg">Đang tải đề thi...</p>
          </div>
        ) : (!exams || exams.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-600">
            <p className="text-lg mb-4">Không tìm thấy đề thi nào.</p>
            <p className="text-sm mb-6">Hãy thử thay đổi bộ lọc hoặc tạo đề thi mới.</p>
            <Link
              to="/CreateExam"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-medium shadow-md"
            >
              Tạo đề thi mới
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {exams && exams.map((exam) => (
              <div key={exam.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-black mb-1">{exam.title}</h2>
                    <p className="text-sm text-gray-600">
                      {exam.list_question?.length || 0} câu hỏi • {exam.duration} phút
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetail(exam.id)}
                      className="text-green-500 hover:text-green-700 transition"
                      title="Xem chi tiết"
                    >
                      <span className="text-lg">👁️</span>
                    </button>
                    <button
                      onClick={() => handleEditClick(exam.id)}
                      className="text-blue-500 hover:text-blue-700 transition"
                      title="Chỉnh sửa"
                    >
                      <span className="text-lg">✏️</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(exam.id)}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Xóa"
                    >
                      <span className="text-lg">🗑️</span>
                    </button>
                  </div>
                </div>

                <p className="text-black mb-3">{exam.note}</p>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <span className="font-medium">Mở đề:</span> {new Date(exam.earliest_start_time).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Đóng đề:</span> {exam.lastest_start_time ? new Date(exam.lastest_start_time).toLocaleString() : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Lượt thi tối đa:</span> {exam.max_attempt || 'Không giới hạn'}
                  </div>
                  {exam.creator && (
                    <div>
                      <span className="font-medium">Tạo bởi:</span> {exam.creator.username}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-8">
            <div className="text-sm text-black">
              Trang {pagination.page} / {pagination.totalPages} • {pagination.totalItems} đề thi • {pagination.limit} đề thi/trang
            </div>
            <div className="flex items-center gap-4">
              <select
                value={pagination.limit}
                onChange={handleLimitChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white font-medium"
              >
                <option value="5">5 đề thi/trang</option>
                <option value="10">10 đề thi/trang</option>
                <option value="20">20 đề thi/trang</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-black bg-white hover:bg-gray-100 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 border border-gray-300 rounded-lg transition font-medium ${
                      pagination.page === i + 1
                        ? 'bg-blue-500 text-white'
                        : 'text-black bg-white hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-black bg-white hover:bg-gray-100 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        type={confirmModal.type}
      />
    </div>
  );
};

export default ExamBank;
