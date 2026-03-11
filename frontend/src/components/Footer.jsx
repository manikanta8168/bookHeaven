import { Link } from 'react-router-dom';
import { BookOpen, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    const whatsappUrl = 'https://wa.me/919032729367?text=Hi%2C%20I%20need%20help%20with%20my%20order.';

    return (
        <footer className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border mt-auto pt-16 pb-8 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <BookOpen className="h-8 w-8 text-primary-600" />
                            <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">Book<span className="text-primary-600">Heaven</span></span>
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            Your premier destination for captivating stories and deep knowledge. Discover a world of literature curated just for you.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="h-10 w-10 bg-gray-50 dark:bg-dark-bg rounded-full flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="h-10 w-10 bg-gray-50 dark:bg-dark-bg rounded-full flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="h-10 w-10 bg-gray-50 dark:bg-dark-bg rounded-full flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">
                                <Instagram className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors text-sm">Home</Link></li>
                            <li><Link to="/shop" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors text-sm">Shop Books</Link></li>
                            <li><Link to="/categories" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors text-sm">Categories</Link></li>
                            <li><Link to="/sell-with-us" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors text-sm">Sell With Us</Link></li>
                            <li><Link to="/about" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors text-sm">About Us</Link></li>
                        </ul>
                    </div>

                    {}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Support</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors text-sm">
                                    Contact Us
                                </a>
                            </li>
                            <li><Link to="/faq" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors text-sm">FAQ</Link></li>
                            <li><Link to="/shipping" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors text-sm">Shipping Info</Link></li>
                            <li><Link to="/returns" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors text-sm">Returns</Link></li>
                        </ul>
                    </div>

                    {}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-gray-500 dark:text-gray-400">
                                <MapPin className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
                                <span>LPU, Jalandhar<br />Punjab, India</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                <Phone className="h-5 w-5 text-primary-500 shrink-0" />
                                <span>WhatsApp Support</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                <Mail className="h-5 w-5 text-primary-500 shrink-0" />
                                <span>support@bookheaven.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-dark-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} BookHeaven. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <Link to="/returns" className="text-xs text-gray-400 hover:text-primary-500">Privacy Policy</Link>
                        <Link to="/shipping" className="text-xs text-gray-400 hover:text-primary-500">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
