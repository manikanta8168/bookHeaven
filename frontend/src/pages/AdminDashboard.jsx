import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ShoppingCart, AlertTriangle, IndianRupee } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import { formatINR } from '../utils/currency';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { userInfo } = useAuthStore();
    const [books, setBooks] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const config = userInfo ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : {};

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/admin/login');
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                const [booksRes, ordersRes] = await Promise.all([
                    api.get('/books?paginate=true&limit=300'),
                    api.get('/orders?paginate=true&limit=300', config),
                ]);
                setBooks(Array.isArray(booksRes.data) ? booksRes.data : (booksRes.data?.items || []));
                setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.items || []));
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [userInfo, navigate]);

    const stats = useMemo(() => {
        const paidOrdersList = orders.filter((o) => o.isPaid && !o.isCancelled);
        const totalRevenue = paidOrdersList.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
        const lowStockBooks = books.filter((b) => Number(b.countInStock || 0) <= 3);
        const paidOrders = paidOrdersList.length;
        const cancelledOrders = orders.filter((o) => o.isCancelled).length;
        const deliveredOrders = orders.filter((o) => o.isDelivered).length;
        const monthlyRevenueMap = {};
        for (const order of paidOrdersList) {
            const date = new Date(order.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyRevenueMap[key] = (monthlyRevenueMap[key] || 0) + Number(order.totalPrice || 0);
        }
        const monthlyRevenue = Object.entries(monthlyRevenueMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-6)
            .map(([month, value]) => ({ month, value }));
        return {
            totalBooks: books.length,
            totalOrders: orders.length,
            totalRevenue,
            paidOrders,
            cancelledOrders,
            deliveredOrders,
            monthlyRevenue,
            lowStockBooks,
        };
    }, [books, orders]);

    if (loading) {
        return <div className="max-w-7xl mx-auto px-4 py-10">Loading dashboard...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <div className="flex gap-3">
                    <Link to="/admin/books" className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">Manage Books</Link>
                    <Link to="/admin/orders" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200">Manage Orders</Link>
                </div>
            </div>

            {error ? <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div> : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex justify-between mb-2"><BookOpen className="h-5 w-5 text-primary-600" /><span className="text-xs text-gray-700 font-bold">Books</span></div>
                    <div className="text-2xl font-bold">{stats.totalBooks}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex justify-between mb-2"><ShoppingCart className="h-5 w-5 text-primary-600" /><span className="text-xs text-gray-700 font-bold">Orders</span></div>
                    <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex justify-between mb-2"><IndianRupee className="h-5 w-5 text-primary-600" /><span className="text-xs text-gray-700 font-bold">Revenue</span></div>
                    <div className="text-2xl font-bold">{formatINR(stats.totalRevenue)}</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex justify-between mb-2"><AlertTriangle className="h-5 w-5 text-red-500" /><span className="text-xs text-gray-700 font-bold">Low Stock</span></div>
                    <div className="text-2xl font-bold">{stats.lowStockBooks.length}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h2 className="text-xl font-semibold mb-4">Sales Trend (Last 6 Months)</h2>
                    {stats.monthlyRevenue.length === 0 ? (
                        <p className="text-gray-500">Not enough order data.</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.monthlyRevenue.map((item) => {
                                const max = Math.max(...stats.monthlyRevenue.map((m) => m.value), 1);
                                const width = Math.max((item.value / max) * 100, 6);
                                return (
                                    <div key={item.month}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>{item.month}</span>
                                            <span>{formatINR(item.value)}</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary-600 rounded-full" style={{ width: `${width}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h2 className="text-xl font-semibold mb-4">Order Status Mix</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between border border-gray-100 rounded-lg p-3">
                            <span>Paid</span>
                            <span className="font-semibold">{stats.paidOrders}</span>
                        </div>
                        <div className="flex justify-between border border-gray-100 rounded-lg p-3">
                            <span>Delivered</span>
                            <span className="font-semibold">{stats.deliveredOrders}</span>
                        </div>
                        <div className="flex justify-between border border-gray-100 rounded-lg p-3">
                            <span>Cancelled</span>
                            <span className="font-semibold">{stats.cancelledOrders}</span>
                        </div>
                        <div className="flex justify-between border border-gray-100 rounded-lg p-3">
                            <span>Active</span>
                            <span className="font-semibold">{Math.max(stats.totalOrders - stats.cancelledOrders, 0)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h2 className="text-xl font-semibold mb-4">Low Stock Alerts</h2>
                    {stats.lowStockBooks.length === 0 ? (
                        <p className="text-gray-500">No low-stock books.</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.lowStockBooks.slice(0, 8).map((book) => (
                                <div key={book._id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                                    <span className="font-medium">{book.title}</span>
                                    <span className="text-red-600 text-sm font-semibold">{book.countInStock} left</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                    {orders.length === 0 ? (
                        <p className="text-gray-500">No orders yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {orders
                                .slice()
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .slice(0, 8)
                                .map((order) => (
                                    <div key={order._id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                                        <div>
                                            <p className="font-mono text-xs text-gray-500">{order._id.slice(0, 10)}...</p>
                                            <p className="text-sm">{order.user?.name || 'Unknown User'}</p>
                                        </div>
                                        <span className="font-semibold">{formatINR(order.totalPrice)}</span>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
