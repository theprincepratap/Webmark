import { AlertTriangle, X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false 
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'bg-red-100 dark:bg-red-900/20 text-red-600',
      button: 'btn-danger',
    },
    warning: {
      icon: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600',
      button: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    },
    info: {
      icon: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
      button: 'btn-primary',
    },
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content max-w-sm" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          {/* Icon */}
          <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4 ${styles.icon}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`btn ${styles.button}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Please wait...</span>
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
