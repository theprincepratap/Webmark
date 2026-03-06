import { useState, useEffect } from 'react';
import { X, Link2, Globe } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const AddBookmarkModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editBookmark = null, 
  categories = [], 
  currentCategoryId = null,
  isLoading = false 
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [errors, setErrors] = useState({});
  const [faviconPreview, setFaviconPreview] = useState('');

  const isEdit = !!editBookmark;

  useEffect(() => {
    if (editBookmark) {
      setTitle(editBookmark.title);
      setUrl(editBookmark.url);
      setDescription(editBookmark.description || '');
      setCategoryId(editBookmark.categoryId?._id || editBookmark.categoryId || currentCategoryId || '');
      updateFaviconPreview(editBookmark.url);
    } else {
      setTitle('');
      setUrl('');
      setDescription('');
      setCategoryId(currentCategoryId || (categories.length > 0 ? categories[0]._id : ''));
      setFaviconPreview('');
    }
    setErrors({});
  }, [editBookmark, isOpen, currentCategoryId, categories]);

  const updateFaviconPreview = (urlValue) => {
    try {
      if (urlValue && urlValue.startsWith('http')) {
        const domain = new URL(urlValue).hostname;
        setFaviconPreview(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
      }
    } catch {
      setFaviconPreview('');
    }
  };

  const handleUrlChange = (e) => {
    const value = e.target.value;
    setUrl(value);
    setErrors({ ...errors, url: '' });
    updateFaviconPreview(value);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    if (!url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try {
        const urlObj = new URL(url);
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          newErrors.url = 'URL must start with http:// or https://';
        }
      } catch {
        newErrors.url = 'Please enter a valid URL';
      }
    }

    if (!categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSubmit({
      title: title.trim(),
      url: url.trim(),
      description: description.trim(),
      categoryId,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Bookmark' : 'Add Bookmark'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Website URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com"
                className={`input pl-10 ${errors.url ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
            </div>
            {errors.url && (
              <p className="mt-1.5 text-sm text-red-500">{errors.url}</p>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors({ ...errors, title: '' });
              }}
              placeholder="e.g., ChatGPT - AI Assistant"
              className={`input ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.title && (
              <p className="mt-1.5 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setErrors({ ...errors, categoryId: '' });
              }}
              className={`input ${errors.categoryId ? 'border-red-500 focus:ring-red-500' : ''}`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1.5 text-sm text-red-500">{errors.categoryId}</p>
            )}
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: '' });
              }}
              placeholder="Add a short description..."
              rows={3}
              className={`input resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            <div className="flex justify-between mt-1">
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
              <p className="text-xs text-gray-400 ml-auto">
                {description.length}/500
              </p>
            </div>
          </div>

          {/* Preview */}
          {(title || url) && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview</p>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                  {faviconPreview ? (
                    <img
                      src={faviconPreview}
                      alt=""
                      className="w-6 h-6"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Globe className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {title || 'Bookmark Title'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {url ? getDomain(url) : 'example.com'}
                  </p>
                </div>
              </div>
            </div>
          )}

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
                  <span>{isEdit ? 'Saving...' : 'Adding...'}</span>
                </>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Add Bookmark'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export default AddBookmarkModal;
