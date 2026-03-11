import { Link } from 'react-router-dom';

const categories = [
    'Fiction',
    'Classic',
    'Fantasy',
    'Romance',
    'Dystopian',
    'Science Fiction',
    'Mystery',
    'History',
    'Business',
    'Technology'
];

const Categories = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Browse Categories</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Pick a category to view matching books.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {categories.map((category) => (
                    <Link
                        key={category}
                        to={`/shop?category=${encodeURIComponent(category)}`}
                        className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl px-4 py-6 text-center font-semibold text-gray-800 dark:text-gray-100 hover:border-primary-500 hover:text-primary-600 transition-colors"
                    >
                        {category}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Categories;
