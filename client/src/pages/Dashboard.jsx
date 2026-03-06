import { useState, useEffect, useCallback } from 'react';
import { Plus, FolderPlus, Search, Bookmark } from 'lucide-react';
import Navbar from '../components/Navbar';
import CategoryCard from '../components/CategoryCard';
import AddCategoryModal from '../components/AddCategoryModal';
import AddBookmarkModal from '../components/AddBookmarkModal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { DashboardSkeleton, BookmarkCardSkeleton } from '../components/Skeleton';
import BookmarkCard from '../components/BookmarkCard';
import { categoriesAPI, bookmarksAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  // State
  const [categories, setCategories] = useState([]);
  const [recentBookmarks, setRecentBookmarks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Modal states
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deletingBookmark, setDeletingBookmark] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, recentRes] = await Promise.all([
        categoriesAPI.getAll(),
        bookmarksAPI.getRecent(5),
      ]);
      setCategories(categoriesRes.data.data);
      setRecentBookmarks(recentRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Search handler
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await bookmarksAPI.search(query);
      setSearchResults(response.data.data);
    } catch (error) {
      console.error('Search error:', error);
    }
  }, []);

  // Category handlers
  const handleCreateCategory = async (data) => {
    try {
      setModalLoading(true);
      const response = await categoriesAPI.create(data);
      setCategories((prev) => [response.data.data, ...prev]);
      setCategoryModalOpen(false);
      toast.success('Category created');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditCategory = async (data) => {
    try {
      setModalLoading(true);
      const response = await categoriesAPI.update(editingCategory._id, data);
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === editingCategory._id ? response.data.data : cat
        )
      );
      setCategoryModalOpen(false);
      setEditingCategory(null);
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
      await categoriesAPI.delete(deletingCategory._id);
      setCategories((prev) =>
        prev.filter((cat) => cat._id !== deletingCategory._id)
      );
      setDeleteModalOpen(false);
      setDeletingCategory(null);
      toast.success('Category deleted');
      // Refresh recent bookmarks
      const recentRes = await bookmarksAPI.getRecent(5);
      setRecentBookmarks(recentRes.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    } finally {
      setModalLoading(false);
    }
  };

  // Bookmark handlers
  const handleCreateBookmark = async (data) => {
    try {
      setModalLoading(true);
      await bookmarksAPI.create(data);
      setBookmarkModalOpen(false);
      toast.success('Bookmark added');
      // Refresh data
      fetchData();
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
      setRecentBookmarks((prev) =>
        prev.map((b) => (b._id === editingBookmark._id ? response.data.data : b))
      );
      setSearchResults((prev) =>
        prev.map((b) => (b._id === editingBookmark._id ? response.data.data : b))
      );
      setBookmarkModalOpen(false);
      setEditingBookmark(null);
      toast.success('Bookmark updated');
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
      setRecentBookmarks((prev) =>
        prev.filter((b) => b._id !== deletingBookmark._id)
      );
      setSearchResults((prev) =>
        prev.filter((b) => b._id !== deletingBookmark._id)
      );
      setDeleteModalOpen(false);
      setDeletingBookmark(null);
      toast.success('Bookmark deleted');
      // Refresh categories count
      const categoriesRes = await categoriesAPI.getAll();
      setCategories(categoriesRes.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete bookmark');
    } finally {
      setModalLoading(false);
    }
  };

  // Open edit/delete modals
  const openEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const openDeleteCategory = (category) => {
    setDeletingCategory(category);
    setDeleteModalOpen(true);
  };

  const openEditBookmark = (bookmark) => {
    setEditingBookmark(bookmark);
    setBookmarkModalOpen(true);
  };

  const openDeleteBookmark = (bookmark) => {
    setDeletingBookmark(bookmark);
    setDeleteModalOpen(true);
  };

  // Calculate totals
  const totalBookmarks = categories.reduce((sum, cat) => sum + (cat.bookmarkCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar onSearch={handleSearch} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isSearching ? 'Search Results' : 'Your Bookmarks'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {isSearching
                ? `Found ${searchResults.length} bookmark${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`
                : `${categories.length} categories • ${totalBookmarks} bookmarks`}
            </p>
          </div>

          {!isSearching && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingBookmark(null);
                  setBookmarkModalOpen(true);
                }}
                className="btn btn-secondary"
                disabled={categories.length === 0}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Bookmark</span>
              </button>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryModalOpen(true);
                }}
                className="btn btn-primary"
              >
                <FolderPlus className="w-4 h-4" />
                <span className="hidden sm:inline">New Category</span>
              </button>
            </div>
          )}
        </div>

        {/* Search Results */}
        {isSearching ? (
          <div className="space-y-3">
            {searchResults.length > 0 ? (
              searchResults.map((bookmark) => (
                <BookmarkCard
                  key={bookmark._id}
                  bookmark={bookmark}
                  onEdit={openEditBookmark}
                  onDelete={openDeleteBookmark}
                />
              ))
            ) : (
              <EmptyState
                icon={Search}
                title="No results found"
                description={`We couldn't find any bookmarks matching "${searchQuery}". Try different keywords.`}
              />
            )}
          </div>
        ) : loading ? (
          <DashboardSkeleton />
        ) : categories.length > 0 ? (
          <>
            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
              {categories.map((category, index) => (
                <div
                  key={category._id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CategoryCard
                    category={category}
                    onEdit={openEditCategory}
                    onDelete={openDeleteCategory}
                  />
                </div>
              ))}
            </div>

            {/* Recent Bookmarks */}
            {recentBookmarks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recently Added
                </h2>
                <div className="space-y-3">
                  {recentBookmarks.map((bookmark) => (
                    <BookmarkCard
                      key={bookmark._id}
                      bookmark={bookmark}
                      onEdit={openEditBookmark}
                      onDelete={openDeleteBookmark}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="No categories yet"
            description="Create your first category to start organizing your bookmarks. Categories help you group related links together."
            actionLabel="Create Category"
            onAction={() => {
              setEditingCategory(null);
              setCategoryModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Floating Action Button (Mobile) */}
      {!isSearching && categories.length > 0 && (
        <button
          onClick={() => {
            setEditingBookmark(null);
            setBookmarkModalOpen(true);
          }}
          className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Modals */}
      <AddCategoryModal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={editingCategory ? handleEditCategory : handleCreateCategory}
        editCategory={editingCategory}
        isLoading={modalLoading}
      />

      <AddBookmarkModal
        isOpen={bookmarkModalOpen}
        onClose={() => {
          setBookmarkModalOpen(false);
          setEditingBookmark(null);
        }}
        onSubmit={editingBookmark ? handleEditBookmark : handleCreateBookmark}
        editBookmark={editingBookmark}
        categories={categories}
        isLoading={modalLoading}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingCategory(null);
          setDeletingBookmark(null);
        }}
        onConfirm={deletingCategory ? handleDeleteCategory : handleDeleteBookmark}
        title={deletingCategory ? 'Delete Category' : 'Delete Bookmark'}
        message={
          deletingCategory
            ? `Are you sure you want to delete "${deletingCategory.name}"? All bookmarks in this category will also be deleted.`
            : `Are you sure you want to delete "${deletingBookmark?.title}"?`
        }
        confirmText="Delete"
        isLoading={modalLoading}
      />
    </div>
  );
};

export default Dashboard;
