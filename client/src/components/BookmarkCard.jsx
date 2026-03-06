import { useState } from 'react';
import { 
  ExternalLink, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  Globe,
  GripVertical
} from 'lucide-react';

const BookmarkCard = ({ bookmark, onEdit, onDelete, isDragging = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleOpenLink = (e) => {
    e.stopPropagation();
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(bookmark);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(bookmark);
  };

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div
      className={`group relative card p-4 transition-all duration-200 ${
        isDragging 
          ? 'shadow-lg scale-[1.02] bg-primary-50 dark:bg-primary-900/20' 
          : 'hover:border-gray-300 dark:hover:border-gray-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div className="flex-shrink-0 mt-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        {/* Favicon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
          {!imageError && bookmark.favicon ? (
            <img
              src={bookmark.favicon}
              alt=""
              className="w-6 h-6"
              onError={() => setImageError(true)}
            />
          ) : (
            <Globe className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {bookmark.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {getDomain(bookmark.url)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleOpenLink}
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                title="Open link"
              >
                <ExternalLink className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  onClick={handleMenuClick}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-36 py-1 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-10 animate-scale-in">
                    <button
                      onClick={handleEdit}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {bookmark.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {bookmark.description}
            </p>
          )}
        </div>
      </div>

      {/* Click overlay to open link */}
      <div 
        onClick={handleOpenLink}
        className="absolute inset-0 cursor-pointer"
        style={{ zIndex: -1 }}
      />
    </div>
  );
};

export default BookmarkCard;
