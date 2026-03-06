import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Folder, 
  FolderOpen, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  Bookmark,
  Palette,
  Code,
  BookOpen,
  Wrench,
  Globe,
  Star,
  Heart,
  Zap,
  Music,
  Video,
  Image,
  FileText,
  Coffee,
  Briefcase
} from 'lucide-react';

// Icon mapping
const iconMap = {
  folder: Folder,
  'folder-open': FolderOpen,
  bookmark: Bookmark,
  palette: Palette,
  code: Code,
  'book-open': BookOpen,
  wrench: Wrench,
  globe: Globe,
  star: Star,
  heart: Heart,
  zap: Zap,
  music: Music,
  video: Video,
  image: Image,
  'file-text': FileText,
  coffee: Coffee,
  briefcase: Briefcase,
};

const CategoryCard = ({ category, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const IconComponent = iconMap[category.icon] || Folder;

  const handleClick = () => {
    navigate(`/category/${category._id}`);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(category);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(category);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
      className="group relative card p-5 cursor-pointer hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Menu Button */}
      <div className={`absolute top-3 right-3 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
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

      {/* Icon */}
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${category.color}20` }}
      >
        <IconComponent 
          className="w-6 h-6" 
          style={{ color: category.color }}
        />
      </div>

      {/* Category Name */}
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
        {category.name}
      </h3>

      {/* Bookmark Count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {category.bookmarkCount} {category.bookmarkCount === 1 ? 'bookmark' : 'bookmarks'}
      </p>

      {/* Hover Indicator */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
        style={{ backgroundColor: category.color }}
      />
    </div>
  );
};

export default CategoryCard;
