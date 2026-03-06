import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

// Available icons
const iconOptions = [
  { value: 'folder', label: 'Folder' },
  { value: 'bookmark', label: 'Bookmark' },
  { value: 'code', label: 'Code' },
  { value: 'palette', label: 'Design' },
  { value: 'book-open', label: 'Learning' },
  { value: 'wrench', label: 'Tools' },
  { value: 'globe', label: 'Web' },
  { value: 'star', label: 'Favorites' },
  { value: 'heart', label: 'Liked' },
  { value: 'zap', label: 'Quick' },
  { value: 'music', label: 'Music' },
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Images' },
  { value: 'file-text', label: 'Documents' },
  { value: 'coffee', label: 'Casual' },
  { value: 'briefcase', label: 'Work' },
];

// Available colors
const colorOptions = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6b7280', // Gray
  '#000000', // Black
];

const AddCategoryModal = ({ isOpen, onClose, onSubmit, editCategory = null, isLoading = false }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('folder');
  const [color, setColor] = useState('#6366f1');
  const [error, setError] = useState('');

  const isEdit = !!editCategory;

  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name);
      setIcon(editCategory.icon || 'folder');
      setColor(editCategory.color || '#6366f1');
    } else {
      setName('');
      setIcon('folder');
      setColor('#6366f1');
    }
    setError('');
  }, [editCategory, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    if (name.trim().length > 50) {
      setError('Category name cannot exceed 50 characters');
      return;
    }

    onSubmit({ name: name.trim(), icon, color });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Category' : 'Create Category'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g., AI Tools"
              className="input"
              autoFocus
            />
            {error && (
              <p className="mt-1.5 text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {iconOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIcon(opt.value)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    icon === opt.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title={opt.label}
                >
                  <span className="text-lg">{getIconEmoji(opt.value)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900' : ''
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <Check className={`w-4 h-4 mx-auto ${c === '#000000' ? 'text-white' : 'text-white'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview</p>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <span className="text-xl">{getIconEmoji(icon)}</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {name || 'Category Name'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>{isEdit ? 'Saving...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Create Category'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper function to get emoji for icon
function getIconEmoji(icon) {
  const emojiMap = {
    folder: '📁',
    bookmark: '🔖',
    code: '💻',
    palette: '🎨',
    'book-open': '📚',
    wrench: '🔧',
    globe: '🌐',
    star: '⭐',
    heart: '❤️',
    zap: '⚡',
    music: '🎵',
    video: '🎬',
    image: '🖼️',
    'file-text': '📄',
    coffee: '☕',
    briefcase: '💼',
  };
  return emojiMap[icon] || '📁';
}

export default AddCategoryModal;
