import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Rating from './Rating';
import { ShoppingCart } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import { handleBookImageError } from '../utils/imageFallback';
import { formatINR } from '../utils/currency';
import api from '../lib/api';

const BookCard = ({ book }) => {
    const addToCart = useCartStore((state) => state.addToCart);
    const navigate = useNavigate();
    const [importing, setImporting] = useState(false);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({ ...book, qty: 1 });
    };

    const handleBookClick = async (e) => {
        
        if (book.isExternal) {
            e.preventDefault();
            try {
                setImporting(true);
                
                const { data } = await api.post(`/books/import/${book._id}`);
                
                navigate(`/book/${data._id}`);
            } catch (err) {
                console.error("Failed to import book:", err);
                setImporting(false);
            }
        } else {
            
            navigate(`/book/${book._id}`);
        }
    };

    return (
        <div className="group bg-white dark:bg-dark-surface rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 dark:border-dark-border">
            <div onClick={handleBookClick} className="relative overflow-hidden aspect-3/4 block cursor-pointer">
                <img
                    src={book.image}
                    alt={book.title}
                    onError={handleBookImageError}
                    className={`w-full h-full object-cover object-center transition-all duration-500 ${importing ? 'opacity-50 blur-sm' : 'group-hover:scale-105'}`}
                    loading="lazy"
                />
                
                {importing && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-bold text-sm tracking-widest backdrop-blur-sm">
                         LOADING...
                     </div>
                )}

                {book.countInStock === 0 && !book.isExternal && !importing && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
                        Out of Stock
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col grow">
                <div className="text-xs font-semibold text-primary-600 dark:text-primary-500 mb-1 uppercase tracking-wider">
                    {book.category}
                </div>

                <div onClick={handleBookClick} className="cursor-pointer">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors" title={book.title}>
                        {book.title}
                    </h3>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
                    {book.author}
                </p>

                <div className="mb-auto">
                    <Rating value={book.rating} text={`(${book.numReviews})`} />
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatINR(book.price)}
                    </span>

                    <button
                        onClick={handleAddToCart}
                        disabled={(book.countInStock === 0 && !book.isExternal) || importing}
                        className={`flex items-center justify-center p-2 rounded-full transition-all ${(book.countInStock === 0 && !book.isExternal) || importing
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                                : 'bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white dark:bg-primary-900/30 dark:hover:bg-primary-600'
                            }`}
                        aria-label="Add to cart"
                    >
                        <ShoppingCart className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookCard;
