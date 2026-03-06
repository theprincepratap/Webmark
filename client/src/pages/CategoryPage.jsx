import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  MoreHorizontal,
  Pencil,
  Trash2,
  Bookmark,
  FolderOpen
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BookmarkCard from '../components/BookmarkCard';
import AddBookmarkModal from '../components/AddBookmarkModal';
import AddCategoryModal from '../components/AddCategoryModal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { BookmarkListSkeleton } from '../components/Skeleton';
import LoadingSpinner from '../components/LoadingSpinner';
import { categoriesAPI, bookmarksAPI } from '../services/api';
import toast from 'react-hot-toast';

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [category, setCategory] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  // Modal states
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [deleteBookmarkModalOpen, setDeleteBookmarkModalOpen] = useState(false);
  const [deleteCategoryModalOpen, setDeleteCategoryModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [deletingBookmark, setDeletingBookmark] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [categoryRes, categoriesRes] = await Promise.all([
        bookmarksAPI.getByCategory(id),
        categoriesAPI.getAll(),
      ]);
      setCategory(categoryRes.data.data.category);
      setBookmarks(categoryRes.data.data.bookmarks);
      setAllCategories(categoriesRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 404) {
        toast.error('Category not found');
        navigate('/dashboard');
      } else {
        toast.error('Failed to load category');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter bookmarks by search
  const filteredBookmarks = bookmarks.filter((bookmark) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      bookmark.title.toLowerCase().includes(query) ||
      bookmark.url.toLowerCase().includes(query) ||
      bookmark.description?.toLowerCase().includes(query)
    );
  });

  // Bookmark handlers
  const handleCreateBookmark = async (data) => {
    try {
      setModalLoading(true);
      const response = await bookmarksAPI.create({ ...data, categoryId: id });
      setBookmarks((prev) => [response.data.data, ...prev]);
      setBookmarkModalOpen(false);
      toast.success('Bookmark added');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add bookmark');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditBookmark = async (data) => {
    try {
      setModalLoading(true);
      const response = await bookmarksAPI.update(editingBookmark._id, data);
      
      // If category changed, remove from list
      if (data.categoryId && data.categoryId !== id) {
        setBookmarks((prev) => prev.filter((b) => b._id !== editingBookmark._id));
        toast.success('Bookmark moved to another category');
      } else {
        setBookmarks((prev) =>
          prev.map((b) => (b._id === editingBookmark._id ? response.data.data : b))
        );
        toast.success('Bookmark updated');
      }
      
      setBookmarkModalOpen(false);
      setEditingBookmark(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update bookmark');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteBookmark = async () => {
    try {
      setModalLoading(true);
      await bookmarksAPI.delete(deletingBookmark._id);
      setBookmarks((prev) => prev.filter((b) => b._id !== deletingBookmark._id));
      setDeleteBookmarkModalOpen(false);
      setDeletingBookmark(null);
      toast.success('Bookmark deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete bookmark');
    } finally {
      setModalLoading(false);
    }
  };

  // Category handlers
  const handleEditCategory = async (data) => {
    try {
      setModalLoading(true);
      const response = await categoriesAPI.update(id, data);
      setCategory(response.data.data);
      setCategoryModalOpen(false);
      toast.success('Category updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update category');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      setModalLoading(true);
      await categoriesAPI.delete(id);
      toast.success('Category deleted');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    } finally {
      setModalLoading(false);
    }
  };

  // Open edit/delete modals
  const openEditBookmark = (bookmark) => {
    setEditingBookmark(bookmark);
    setBookmarkModalOpen(true);
  };

  const openDeleteBookmark = (bookmark) => {
    setDeletingBookmark(bookmark);
    setDeleteBookmarkModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="animate-pulse">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                <div>
                  <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              </div>
            </div>
          </div>
          <BookmarkListSkeleton />
        </main>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Category Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <FolderOpen 
                className="w-7 h-7" 
                style={{ color: category.color }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {category.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingBookmark(null);
                setBookmarkModalOpen(true);
              }}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Bookmark</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="p-2.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {showCategoryMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowCategoryMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-40 py-1 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-20 animate-scale-in">
                    <button
                      onClick={() => {
                        setShowCategoryMenu(false);
                        setCategoryModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit Category
                    </button>
                    <button
                      onClick={() => {
                        setShowCategoryMenu(false);
                        setDeleteCategoryModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Category
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        {bookmarks.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search in this category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        {/* Bookmark List */}
        {bookmarks.length > 0 ? (
          filteredBookmarks.length > 0 ? (
            <div className="space-y-3">
              {filteredBookmarks.map((bookmark, index) => (
                <div
                  key={bookmark._id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <BookmarkCard
                    bookmark={bookmark}
                    onEdit={openEditBookmark}
                    onDelete={openDeleteBookmark}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title="No matches found"
              description={`No bookmarks match "${searchQuery}" in this category.`}
            />
          )
        ) : (
          <EmptyState
            icon={Bookmark}
            title="No bookmarks yet"
            description="Add your first bookmark to this category. Click the button above to get started."
            actionLabel="Add Bookmark"
            onAction={() => {
              setEditingBookmark(null);
              setBookmarkModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => {
          setEditingBookmark(null);
          setBookmarkModalOpen(true);
        }}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals */}
      <AddBookmarkModal
        isOpen={bookmarkModalOpen}
        onClose={() => {
          setBookmarkModalOpen(false);
          setEditingBookmark(null);
        }}
        onSubmit={editingBookmark ? handleEditBookmark : handleCreateBookmark}
        editBookmark={editingBookmark}
        categories={allCategories}
        currentCategoryId={id}
        isLoading={modalLoading}
      />

      <AddCategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSubmit={handleEditCategory}
        editCategory={category}
        isLoading={modalLoading}
      />

      <ConfirmModal
        isOpen={deleteBookmarkModalOpen}
        onClose={() => {
          setDeleteBookmarkModalOpen(false);
          setDeletingBookmark(null);
        }}
        onConfirm={handleDeleteBookmark}
        title="Delete Bookmark"
        message={`Are you sure you want to delete "${deletingBookmark?.title}"?`}
        confirmText="Delete"
        isLoading={modalLoading}
      />

      <ConfirmModal
        isOpen={deleteCategoryModalOpen}
        onClose={() => setDeleteCategoryModalOpen(false)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${category.name}"? All ${bookmarks.length} bookmark${bookmarks.length !== 1 ? 's' : ''} in this category will also be deleted.`}
        confirmText="Delete"
        isLoading={modalLoading}
      />
    </div>
  );
};

export default CategoryPage;
