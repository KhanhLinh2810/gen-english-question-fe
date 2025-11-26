import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import SidebarMenu from '../components/SidebarMenu';
import ConfirmModal from '../components/ConfirmModal';
import EditQuestionView from '../components/EditQuestionView';
import { getQuestions, deleteQuestion, getQuestionDetail } from '../api/questionApi.js';

const QuestionsBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '', // Combined search for content and tags
    is_current_user_only: true
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5, // Changed from 10 to 5
    total: 0
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'default'
  });
  const [currentView, setCurrentView] = useState('list'); // 'list', 'edit'
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const questionTypes = {
    1: 'Khác',
    2: 'Từ vựng'
  };

  // Load questions
  const loadQuestions = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        is_current_user_only: filters.is_current_user_only
      };

      // Add search parameters if search term exists
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim();
        params.content = searchTerm;
        params.tag = searchTerm;
      }
      
      const response = await getQuestions(params);
      
      if (response.code === 'SUCCESS') {
        setQuestions(response.data.rows || []);
        setPagination(prev => ({
          ...prev,
          page,
          total: response.meta?.total_items || response.data.count || 0
        }));
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Không thể tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  // Edit question
  const handleEditQuestion = async (questionId) => {
    try {
      setLoading(true);
      const response = await getQuestionDetail(questionId);
      
      if (response.code === 'SUCCESS') {
        setSelectedQuestion(response.data);
        setCurrentView('edit');
      }
    } catch (error) {
      console.error('Error loading question detail:', error);
      toast.error('Không thể tải thông tin câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = (questionId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa câu hỏi',
      message: 'Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.',
      type: 'danger',
      onConfirm: () => performDeleteQuestion(questionId)
    });
  };

  const performDeleteQuestion = async (questionId) => {
    try {
      const response = await deleteQuestion(questionId);
      
      if (response.code === 'SUCCESS') {
        toast.success('Xóa câu hỏi thành công!');
        loadQuestions(pagination.page);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      const errorMessage = error.response?.data?.message || 'Không thể xóa câu hỏi';
      toast.error(errorMessage);
    }
  };

  // Filter questions with debounced search
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto search for search field with debounce
    if (field === 'search') {
      // Clear existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Set new timeout for auto search
      const newTimeout = setTimeout(() => {
        loadQuestions(1);
      }, 500); // 500ms delay

      setSearchTimeout(newTimeout);
    }
  };

  const applyFilters = () => {
    loadQuestions(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      is_current_user_only: true
    });
    setTimeout(() => loadQuestions(1), 100);
  };

  // Pagination
  const handlePageChange = (newPage) => {
    loadQuestions(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({
      ...prev,
      limit: newLimit,
      page: 1 // Reset to first page when changing limit
    }));
    // Reload with new limit
    setTimeout(() => loadQuestions(1), 100);
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  // Close modals
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      type: 'default'
    });
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedQuestion(null);
    loadQuestions(pagination.page); // Reload questions after edit
  };

  // Load initial data
  useEffect(() => {
    loadQuestions();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className="flex gap-4 bg-gray-100 min-h-screen p-4">
      {/* Sidebar */}
      <div className="w-96">
        <SidebarMenu />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {currentView === 'edit' && selectedQuestion ? (
          <EditQuestionView 
            question={selectedQuestion} 
            onBack={handleBackToList}
            onSaveSuccess={handleBackToList}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6" style={{minHeight: 'calc(100vh - 32px)'}}>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-black mb-1">Ngân hàng câu hỏi</h1>
                <p className="text-gray-600 text-sm">Quản lý tất cả câu hỏi của bạn</p>
              </div>
              <Link
                to="/manual-questions"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-medium shadow-md"
              >
                Tạo câu hỏi mới
              </Link>
            </div>

          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Tìm kiếm</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                    placeholder="Nhập để tìm kiếm tự động theo nội dung hoặc tags..."
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium placeholder-gray-500"
                  />
                  {loading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={applyFilters}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Tìm kiếm
                </button>
                <button
                  onClick={clearFilters}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition font-medium"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="myQuestions"
                  checked={filters.is_current_user_only}
                  onChange={(e) => handleFilterChange('is_current_user_only', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="myQuestions" className="text-sm font-medium text-black">
                  Chỉ hiển thị câu hỏi của tôi
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-black">Hiển thị:</label>
                <select
                  value={pagination.limit}
                  onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5 câu hỏi/trang</option>
                  <option value={10}>10 câu hỏi/trang</option>
                  <option value={20}>20 câu hỏi/trang</option>
                </select>
              </div>
            </div>
          </div>

          {/* Questions List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Đang tải câu hỏi...</div>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <p className="text-lg mb-4">Không tìm thấy câu hỏi nào.</p>
              <p className="text-sm mb-6">Hãy thử thay đổi bộ lọc hoặc tạo câu hỏi mới.</p>
              <Link
                to="/manual-questions"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-medium shadow-md"
              >
                Tạo câu hỏi mới
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-black">Câu {(pagination.page - 1) * pagination.limit + index + 1}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {questionTypes[question.type] || 'Khác'}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          {question.score} điểm
                        </span>
                        {question.tags && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                            {question.tags}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-black mb-2">{question.content}</h3>
                      {question.description && (
                        <p className="text-gray-600 text-sm mb-3">{question.description}</p>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEditQuestion(question.id)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                        title="Chỉnh sửa"
                      >
                        <span className="text-lg">✏️</span>
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                        title="Xóa"
                      >
                        <span className="text-lg">🗑️</span>
                      </button>
                    </div>
                  </div>

                  {/* Choices */}
                  {question.choices && question.choices.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {question.choices.map((choice, choiceIndex) => (
                        <div
                          key={choice.id}
                          className={`p-2 rounded border text-sm ${
                            choice.is_correct 
                              ? 'bg-green-50 border-green-200 text-green-800' 
                              : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {choice.is_correct && <span className="text-green-600">✓</span>}
                              <span className="font-medium">{String.fromCharCode(65 + choiceIndex)}.</span>
                              <span>{choice.content}</span>
                            </div>
                            {choice.explanation && (
                              <div className="text-xs text-gray-600 italic ml-6">
                                Giải thích: {choice.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Creator Info */}
                  {question.creator && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Tạo bởi:</span>
                        <span className="font-medium">{question.creator.username}</span>
                        <span>•</span>
                        <span>{new Date(question.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 pt-6 border-t border-gray-200">
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
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 text-black bg-white hover:bg-gray-50'
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
              
              <span className="ml-4 text-sm text-gray-600">
                Trang {pagination.page} / {totalPages} • {pagination.total} câu hỏi • {pagination.limit} câu hỏi/trang
              </span>
            </div>
          )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default QuestionsBank;
