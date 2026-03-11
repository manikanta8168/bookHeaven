import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogIn, Search, Menu, X, BookOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const navigate = useNavigate();

    const userInfo = useAuthStore((state) => state.userInfo);
    const logout = useAuthStore((state) => state.logout);
    const cartItems = useCartStore((state) => state.cartItems);

    const cartItemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/shop?keyword=${searchTerm}`);
        } else {
            navigate('/shop');
        }
    };

    const handleLogout = () => {
        logout();
        setProfileMenuOpen(false);
        navigate('/');
    };

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    return (
        <nav className="bg-white dark:bg-dark-surface shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <BookOpen className="h-8 w-8 text-primary-600" />
                            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Book<span className="text-primary-600">Heaven</span></span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
                        <form onSubmit={handleSearch} className="w-full relative">
                            <input
                                type="text"
                                placeholder="Search books by title, author, or category..."
                                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100 placeholder-gray-500 transition-all duration-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                        </form>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        {!userInfo?.isAdmin && (
                            <Link to="/shop" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-500 font-medium transition-colors">
                                Shop
                            </Link>
                        )}
                        <Link to="/sell-with-us" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-500 font-medium transition-colors">
                            Sell With Us
                        </Link>

                        {!userInfo?.isAdmin && (
                            <Link to="/cart" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-500 relative transition-colors">
                                <ShoppingCart className="h-6 w-6" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {userInfo ? (
                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                                    className="flex items-center gap-2 text-gray-600 hover:text-primary-600 dark:text-gray-300 font-medium"
                                    aria-expanded={profileMenuOpen}
                                    aria-haspopup="menu"
                                >
                                    {userInfo.name}
                                </button>
                                {profileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-dark-surface rounded-md shadow-lg py-1 z-50 border border-gray-100 dark:border-dark-border">
                                        <Link to="/account" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">My Account</Link>
                                        {!userInfo.isAdmin && (
                                            <Link to="/cart" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">My Cart</Link>
                                        )}
                                        {userInfo.isAdmin && (
                                            <>
                                                <Link to="/admin/books" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Manage Books</Link>
                                                <Link to="/admin/orders" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Manage Orders</Link>
                                                <Link to="/admin/dashboard" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Dashboard</Link>
                                                <Link to="/admin/collab" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Collab Requests</Link>
                                            </>
                                        )}
                                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full font-medium transition-colors">
                                    <LogIn className="h-4 w-4" />
                                    <span>Login</span>
                                </Link>
                                <Link to="/admin/login" className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-500 font-medium transition-colors">
                                    Admin
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center md:hidden gap-4">
                        {!userInfo?.isAdmin && (
                            <Link to="/cart" className="relative mr-2">
                                <ShoppingCart className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 dark:text-gray-300">
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-white dark:bg-dark-surface border-t dark:border-dark-border px-4 py-4 space-y-4 shadow-lg">
                    <form onSubmit={handleSearch} className="w-full relative">
                        <input
                            type="text"
                            placeholder="Search books..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border focus:outline-none bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </form>

                    {!userInfo?.isAdmin && (
                        <Link to="/shop" className="block text-gray-700 dark:text-gray-300 font-medium py-2 border-b dark:border-dark-border" onClick={() => setIsOpen(false)}>
                            Shop
                        </Link>
                    )}
                    <Link to="/sell-with-us" className="block text-gray-700 dark:text-gray-300 font-medium py-2 border-b dark:border-dark-border" onClick={() => setIsOpen(false)}>
                        Sell With Us
                    </Link>

                    {userInfo ? (
                        <>
                            <Link to="/account" className="block text-gray-700 dark:text-gray-300 font-medium py-2 border-b dark:border-dark-border" onClick={() => setIsOpen(false)}>
                                My Account
                            </Link>
                            {!userInfo.isAdmin && (
                                <Link to="/cart" className="block text-gray-700 dark:text-gray-300 font-medium py-2 border-b dark:border-dark-border" onClick={() => setIsOpen(false)}>
                                    My Cart
                                </Link>
                            )}
                            {userInfo.isAdmin && (
                                <>
                                    <Link to="/admin/books" className="block text-gray-700 dark:text-gray-300 font-medium py-2 border-b dark:border-dark-border" onClick={() => setIsOpen(false)}>
                                        Manage Books
                                    </Link>
                                    <Link to="/admin/orders" className="block text-gray-700 dark:text-gray-300 font-medium py-2 border-b dark:border-dark-border" onClick={() => setIsOpen(false)}>
                                        Manage Orders
                                    </Link>
                                    <Link to="/admin/dashboard" className="block text-gray-700 dark:text-gray-300 font-medium py-2 border-b dark:border-dark-border" onClick={() => setIsOpen(false)}>
                                        Dashboard
                                    </Link>
                                    <Link to="/admin/collab" className="block text-gray-700 dark:text-gray-300 font-medium py-2 border-b dark:border-dark-border" onClick={() => setIsOpen(false)}>
                                        Collab Requests
                                    </Link>
                                </>
                            )}
                            <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left text-gray-700 dark:text-gray-300 font-medium py-2">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors" onClick={() => setIsOpen(false)}>
                                <LogIn className="h-4 w-4" />
                                <span>Login / Sign Up</span>
                            </Link>
                            <Link to="/admin/login" className="block text-gray-700 dark:text-gray-300 font-medium py-2 text-center" onClick={() => setIsOpen(false)}>
                                Admin Login
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
