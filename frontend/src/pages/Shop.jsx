import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BookCard from '../components/BookCard';
import SkeletonCard from '../components/SkeletonCard';
import { Filter } from 'lucide-react';
import api from '../lib/api';

const Shop = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const keyword = searchParams.get('keyword') || '';
    const categoryParam = searchParams.get('category') || '';

    const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All');

    const categories = ['All', 'Fiction', 'Classic', 'Fantasy', 'Romance', 'Dystopian', 'Science Fiction', 'Mystery', 'History', 'Business', 'Technology'];

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                let url = `/books/external?keyword=${encodeURIComponent(keyword)}`;
                if (selectedCategory && selectedCategory !== 'All') {
                    url += `&category=${encodeURIComponent(selectedCategory)}`;
                }
                const { data } = await api.get(url);
                setBooks(data.items || data || []);
                setError(null);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchBooks();
    }, [keyword, selectedCategory]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {keyword ? `Search Results for "${keyword}"` : 'All Books'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Showing {books.length} result{books.length !== 1 && 's'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select
                        className="border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-200 rounded-md shadow-sm py-2 px-4 focus:ring-primary-500 hover:border-primary-400 focus:border-primary-500 transition-colors cursor-pointer"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {loading ? (
                    [...Array(10)].map((_, i) => <SkeletonCard key={i} />)
                ) : error ? (
                    <div className="col-span-full bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
                ) : books.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No books found</h2>
                        <p className="text-gray-500">Try adjusting your search criteria or category filter.</p>
                    </div>
                ) : (
                    books.map((book) => <BookCard key={book._id} book={book} />)
                )}
            </div>
        </div>
    );
};

export default Shop;
