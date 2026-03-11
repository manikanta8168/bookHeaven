import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, BadgeIndianRupee, Boxes } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import { handleBookImageError } from '../utils/imageFallback';
import { formatINR } from '../utils/currency';

const AdminBookEdit = () => {
    const { id } = useParams();
    const isCreateMode = id === 'new' || !id;
    const navigate = useNavigate();
    const { userInfo } = useAuthStore();
    const [form, setForm] = useState({
        title: '',
        author: '',
        price: 300,
        image: '',
        category: '',
        countInStock: 0,
        description: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const authConfig = userInfo
        ? { headers: { Authorization: `Bearer ${userInfo.token}` } }
        : {};

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/login');
            return;
        }

        const fetchBook = async () => {
            if (isCreateMode) {
                setLoading(false);
                return;
            }
            try {
                const { data } = await api.get(`/books/${id}`);
                setForm({
                    title: data.title || '',
                    author: data.author || '',
                    price: Number(data.price || 0),
                    image: data.image || '',
                    category: data.category || '',
                    countInStock: Number(data.countInStock || 0),
                    description: data.description || ''
                });
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id, isCreateMode, userInfo, navigate]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'price' || name === 'countInStock' ? Number(value) : value
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            if (isCreateMode) {
                await api.post('/books', form, authConfig);
            } else {
                await api.put(`/books/${id}`, form, authConfig);
            }
            navigate('/admin/books');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-900 p-7 text-white shadow-2xl mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-300 mb-2">Admin Editor</p>
                        <h1 className="text-3xl font-extrabold">{isCreateMode ? 'Create New Book' : 'Edit Book Details'}</h1>
                        <p className="text-slate-200 mt-1">{isCreateMode ? 'Add a new book to your store catalog.' : 'Update pricing, category, stock, and content metadata.'}</p>
                    </div>
                    <Link
                        to="/admin/books"
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl font-semibold transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Books
                    </Link>
                </div>
            </div>

            {loading ? <div className="bg-white rounded-xl p-6 border border-gray-200">Loading book...</div> : null}
            {error ? <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-5">{error}</div> : null}

            {!loading && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <form onSubmit={onSubmit} className="lg:col-span-8 bg-white dark:bg-dark-surface p-6 md:p-7 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-5">
                        <div>
                            <h2 className="text-lg font-bold mb-3">Core Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 block mb-1">Title</label>
                                    <input name="title" value={form.title} onChange={onChange} required className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 block mb-1">Author</label>
                                    <input name="author" value={form.author} onChange={onChange} required className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 block mb-1">Category</label>
                                    <input name="category" value={form.category} onChange={onChange} required className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 block mb-1">Image URL</label>
                                    <input name="image" value={form.image} onChange={onChange} required className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-bold mb-3">Pricing & Inventory</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 block mb-1">Price</label>
                                    <div className="relative">
                                        <BadgeIndianRupee className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                                        <input type="number" step="1" min="300" max="500" name="price" value={form.price} onChange={onChange} required className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 block mb-1">Stock</label>
                                    <div className="relative">
                                        <Boxes className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                                        <input type="number" min="0" name="countInStock" value={form.countInStock} onChange={onChange} required className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600 block mb-1">Description</label>
                            <textarea name="description" value={form.description} onChange={onChange} rows="6" required className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
                        </div>

                        <button type="submit" disabled={saving} className="w-full inline-flex justify-center items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl disabled:bg-gray-400">
                            <Save className="h-4 w-4" />
                            {saving ? (isCreateMode ? 'Creating...' : 'Saving...') : (isCreateMode ? 'Create Book' : 'Save Changes')}
                        </button>
                    </form>

                    <aside className="lg:col-span-4 bg-white dark:bg-dark-surface p-5 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm h-fit">
                        <h3 className="font-bold text-lg mb-3">Live Preview</h3>
                        <div className="rounded-xl overflow-hidden border border-gray-100">
                            {form.image ? (
                                <img src={form.image} alt={form.title || 'Book preview'} onError={handleBookImageError} className="w-full h-56 object-cover" />
                            ) : (
                                <div className="h-56 bg-gray-50 flex items-center justify-center text-gray-400">
                                    <ImageIcon className="h-8 w-8" />
                                </div>
                            )}
                            <div className="p-4">
                                <h4 className="font-bold text-gray-900 dark:text-white line-clamp-2">{form.title || 'Book title'}</h4>
                                <p className="text-sm text-gray-500 mt-1">{form.author || 'Author'}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-primary-700 font-bold">{formatINR(form.price)}</span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">{form.category || 'Category'}</span>
                                </div>
                                <p className="text-xs mt-2 text-gray-500">Stock: {Number(form.countInStock || 0)}</p>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default AdminBookEdit;
