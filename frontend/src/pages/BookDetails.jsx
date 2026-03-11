import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import { ArrowLeft, ShoppingCart, Check, ShieldCheck, Truck } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import api from '../lib/api';
import { handleBookImageError } from '../utils/imageFallback';
import { formatINR } from '../utils/currency';

const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qty, setQty] = useState(1);

    const addToCart = useCartStore((state) => state.addToCart);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const { data } = await api.get(`/books/${id}`);
                setBook(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    const handleAddToCart = () => {
        addToCart({ ...book, qty: Number(qty) });
        navigate('/cart');
    };

    if (loading) return <div className="py-20"><Loader /></div>;
    if (error) return <div className="p-10 text-center text-red-600 font-bold">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link to="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-8 group">
                <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
                Back to Shop
            </Link>

            <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-0">

                    {}
                    <div className="lg:col-span-5 bg-gray-50 dark:bg-dark-bg p-8 md:p-12 flex justify-center items-center">
                        <img
                            src={book.image}
                            alt={book.title}
                            onError={handleBookImageError}
                            className="rounded-xl shadow-2xl max-h-125 object-contain hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {}
                    <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center">
                        <div className="text-sm font-semibold text-primary-600 dark:text-primary-500 uppercase tracking-widest mb-2">
                            {book.category}
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                            {book.title}
                        </h1>

                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                            by <span className="font-semibold">{book.author}</span>
                        </p>

                        <div className="flex items-center gap-4 mb-8">
                            <Rating value={book.rating} text={`${book.numReviews} reviews`} />
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <span className="text-gray-500 flex items-center gap-1">
                                {book.countInStock > 0 ? (
                                    <><Check className="h-4 w-4 text-green-500" /> <span className="text-green-600 dark:text-green-500 font-medium">In Stock</span></>
                                ) : (
                                    <span className="text-red-500 font-medium">Out of Stock</span>
                                )}
                            </span>
                        </div>

                        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
                            {formatINR(book.price)}
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mb-10">
                            {book.description}
                        </p>

                        <div className="border-t border-gray-100 dark:border-dark-border pt-8 mt-auto">
                            <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                                {book.countInStock > 0 && (
                                    <select
                                        value={qty}
                                        onChange={(e) => setQty(e.target.value)}
                                        className="border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none w-full sm:w-24 text-center cursor-pointer shadow-sm font-medium"
                                    >
                                        {[...Array(Math.max(book.countInStock || 1, 1)).keys()].map(x => (
                                            <option key={x + 1} value={x + 1}>{x + 1}</option>
                                        ))}
                                    </select>
                                )}

                                <button
                                    onClick={handleAddToCart}
                                    disabled={book.countInStock === 0}
                                    className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${book.countInStock === 0
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-800'
                                            : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                                        }`}
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    {book.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-primary-500" />
                                    <span>Secure checkout</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-primary-500" />
                                    <span>Free shipping over {formatINR(500)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;
