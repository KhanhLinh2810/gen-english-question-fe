import React from 'react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Xác nhận", 
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "default" // default, danger, warning, success
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          confirmBtn: 'bg-red-500 hover:bg-red-600 text-white',
          icon: '⚠️',
          iconBg: 'bg-red-100'
        };
      case 'warning':
        return {
          confirmBtn: 'bg-yellow-500 hover:bg-yellow-600 text-white',
          icon: '⚠️',
          iconBg: 'bg-yellow-100'
        };
      case 'success':
        return {
          confirmBtn: 'bg-green-500 hover:bg-green-600 text-white',
          icon: '✓',
          iconBg: 'bg-green-100'
        };
      default:
        return {
          confirmBtn: 'bg-blue-500 hover:bg-blue-600 text-white',
          icon: '?',
          iconBg: 'bg-blue-100'
        };
    }
  };

  const styles = getTypeStyles();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)'
      }}
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-200 scale-100">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center`}>
              <span className="text-2xl">{styles.icon}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            </div>
          </div>
          
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg transition font-medium ${styles.confirmBtn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
