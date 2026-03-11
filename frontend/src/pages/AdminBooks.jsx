import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { Plus, Edit, Trash2, Package, Search, Sparkles, BookOpen, Layers3 } from 'lucide-react';
import api from '../lib/api';
import { handleBookImageError } from '../utils/imageFallback';
import { formatINR } from '../utils/currency';

const AdminBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const { userInfo } = useAuthStore();
    const navigate = useNavigate();

    const config = userInfo
        ? { headers: { Authorization: `Bearer ${userInfo.token}` } }
        : {};

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/books');
            setBooks(data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/login');
            return;
        }
        fetchBooks();
    }, [userInfo, navigate]);

    const createBookHandler = async () => {
        navigate('/admin/books/new');
    };

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await api.delete(`/books/${id}`, config);
                fetchBooks();
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting book');
            }
        }
    };

    const categories = ['All', ...new Set(books.map((book) => book.category).filter(Boolean))];

    const filteredBooks = useMemo(() => {
        return books
            .filter((book) => {
                const term = search.toLowerCase().trim();
                const matchesSearch = term
                    ? [book.title, book.author, book.category].some((field) =>
                        String(field || '').toLowerCase().includes(term)
                    )
                    : true;
                const matchesCategory = categoryFilter === 'All' ? true : book.category === categoryFilter;
                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => {
                if (sortBy === 'priceAsc') return Number(a.price || 0) - Number(b.price || 0);
                if (sortBy === 'priceDesc') return Number(b.price || 0) - Number(a.price || 0);
                if (sortBy === 'titleAsc') return String(a.title || '').localeCompare(String(b.title || ''));
                return String(b._id || '').localeCompare(String(a._id || ''));
            });
    }, [books, search, categoryFilter, sortBy]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 p-7 md:p-8 text-white shadow-2xl mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <p className="inline-flex items-center gap-2 text-xs tracking-wide uppercase bg-white/10 px-3 py-1 rounded-full mb-3">
                            <Sparkles className="h-3.5 w-3.5" />
                            Admin Control
                        </p>
                        <h1 className="text-3xl md:text-4xl font-extrabold">Book Management</h1>
                        <p className="text-slate-200 mt-1">Create, edit, and organize your catalog in one place.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/admin/orders"
                            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl font-semibold transition-colors"
                        >
                            <Package className="h-4 w-4" />
                            Orders
                        </Link>
                        <button
                            onClick={createBookHandler}
                            className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-xl font-bold transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            New Book
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500 mb-1 inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />Total Books</p>
                    <p className="text-2xl font-extrabold">{books.length}</p>
                </div>
                <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500 mb-1 inline-flex items-center gap-1"><Layers3 className="h-3.5 w-3.5" />Visible Books</p>
                    <p className="text-2xl font-extrabold">{filteredBooks.length}</p>
                </div>
                <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Categories</p>
                    <p className="text-2xl font-extrabold">{Math.max(categories.length - 1, 0)}</p>
                </div>
            </div>

            {error ? <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div> : null}

            {loading ? (
                <div className="bg-white rounded-xl p-6 border border-gray-200">Loading books...</div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-dark-surface shadow-sm rounded-2xl border border-gray-200 dark:border-dark-border p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="relative">
                                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search title, author, category"
                                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg"
                                />
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg"
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg"
                            >
                                <option value="newest">Newest</option>
                                <option value="titleAsc">Title A-Z</option>
                                <option value="priceAsc">Price Low to High</option>
                                <option value="priceDesc">Price High to Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-surface shadow-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-slate-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">#</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Book</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Author</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Category</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBooks.map((book, index) => (
                                        <tr key={book._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-slate-50/70 dark:hover:bg-gray-800/40 transition-colors">
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-500">{index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img className="h-12 w-10 rounded-lg object-cover ring-1 ring-gray-200" src={book.image} onError={handleBookImageError} alt="" />
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{book.title}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{book.author}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{formatINR(book.price)}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="inline-flex px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                                                    {book.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                                                <Link
                                                    to={`/admin/books/${book._id}/edit`}
                                                    className="inline-flex items-center justify-center p-2 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4.5 w-4.5" />
                                                </Link>
                                                <button
                                                    onClick={() => deleteHandler(book._id)}
                                                    className="inline-flex items-center justify-center p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4.5 w-4.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBooks;
