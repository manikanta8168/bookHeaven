import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, CreditCard, Truck, UserCircle, Search } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import { formatINR } from '../utils/currency';

const Account = () => {
    const navigate = useNavigate();
    const { userInfo, login } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');

    const config = userInfo
        ? { headers: { Authorization: `Bearer ${userInfo.token}` } }
        : {};

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                const [profileRes, ordersRes] = await Promise.all([
                    api.get('/users/profile', config),
                    api.get('/orders/myorders?paginate=true&limit=100', config)
                ]);
                setProfile(profileRes.data);
                setForm((prev) => ({
                    ...prev,
                    name: profileRes.data?.name || '',
                    email: profileRes.data?.email || ''
                }));
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
        const totalOrders = orders.length;
        const paidOrders = orders.filter((o) => o.isPaid && !o.isCancelled).length;
        const deliveredOrders = orders.filter((o) => o.isDelivered).length;
        const totalSpent = orders
            .filter((o) => !o.isCancelled)
            .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
        return { totalOrders, paidOrders, deliveredOrders, totalSpent };
    }, [orders]);

    const filteredOrders = useMemo(() => {
        return [...orders]
            .filter((order) => {
                const term = query.trim().toLowerCase();
                const searchMatch = term
                    ? [order._id, ...(order.orderItems || []).map((item) => item.name)]
                        .some((v) => String(v || '').toLowerCase().includes(term))
                    : true;

                const statusMatch =
                    status === 'all' ? true :
                        status === 'cancelled' ? order.isCancelled :
                        status === 'paid' ? order.isPaid :
                            status === 'unpaid' ? !order.isPaid :
                                status === 'delivered' ? order.isDelivered :
                                    !order.isDelivered;

                return searchMatch && statusMatch;
            })
            .sort((a, b) => {
                if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                if (sortBy === 'amountHigh') return Number(b.totalPrice || 0) - Number(a.totalPrice || 0);
                if (sortBy === 'amountLow') return Number(a.totalPrice || 0) - Number(b.totalPrice || 0);
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            });
    }, [orders, query, status, sortBy]);

    const submitProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileMessage('');

        if (!form.name.trim() || !form.email.trim()) {
            setProfileMessage('Name and email are required.');
            return;
        }

        if (form.password && form.password !== form.confirmPassword) {
            setProfileMessage('Password and confirm password must match.');
            return;
        }

        try {
            setProfileSaving(true);
            const payload = { name: form.name.trim(), email: form.email.trim() };
            if (form.password) payload.password = form.password;

            const { data } = await api.put('/users/profile', payload, config);
            setProfile({ _id: data._id, name: data.name, email: data.email, isAdmin: data.isAdmin });
            login(data);
            setForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));
            setProfileMessage('Profile updated successfully.');
        } catch (err) {
            setProfileMessage(err.response?.data?.message || err.message);
        } finally {
            setProfileSaving(false);
        }
    };

    if (loading) {
        return <div className="max-w-7xl mx-auto px-4 py-10">Loading account...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-blue-900 text-white p-8 mb-8 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <UserCircle className="h-14 w-14 text-blue-200" />
                        <div>
                            <h1 className="text-3xl font-bold">My Account</h1>
                            <p className="text-blue-100">{profile?.name || userInfo?.name} | {profile?.email || userInfo?.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/shop" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Browse Books</Link>
                        <Link to="/cart" className="px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold hover:bg-blue-50 transition-colors">Go to Cart</Link>
                    </div>
                </div>
            </div>

            {error ? <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div> : null}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3"><Package className="h-5 w-5 text-primary-600" /><span className="text-xs text-gray-500">Orders</span></div>
                    <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </div>
                <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3"><CreditCard className="h-5 w-5 text-emerald-600" /><span className="text-xs text-gray-500">Paid</span></div>
                    <div className="text-2xl font-bold">{stats.paidOrders}</div>
                </div>
                <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3"><Truck className="h-5 w-5 text-blue-600" /><span className="text-xs text-gray-500">Delivered</span></div>
                    <div className="text-2xl font-bold">{stats.deliveredOrders}</div>
                </div>
                <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3"><CreditCard className="h-5 w-5 text-amber-600" /><span className="text-xs text-gray-500">Total Spent</span></div>
                    <div className="text-2xl font-bold">{formatINR(stats.totalSpent)}</div>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Profile Settings</h2>
                    <span className="text-xs text-gray-500">Edit your personal details</span>
                </div>
                <form onSubmit={submitProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Full Name"
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg"
                        required
                    />
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="Email"
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg"
                        required
                    />
                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="New Password (optional)"
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg"
                    />
                    <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm Password"
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg"
                    />
                    <div className="md:col-span-2 flex items-center justify-between gap-3">
                        <span className={`text-sm ${profileMessage.toLowerCase().includes('success') ? 'text-emerald-600' : 'text-red-600'}`}>
                            {profileMessage}
                        </span>
                        <button
                            type="submit"
                            disabled={profileSaving}
                            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:bg-gray-400"
                        >
                            {profileSaving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl p-5 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by order ID or item"
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg"
                        />
                    </div>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg"
                    >
                        <option value="all">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="delivered">Delivered</option>
                        <option value="processing">Processing</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="amountHigh">Amount High-Low</option>
                        <option value="amountLow">Amount Low-High</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl p-5">
                <h2 className="text-xl font-semibold mb-4">Order History</h2>
                {filteredOrders.length === 0 ? (
                    <p className="text-gray-500">No matching orders found.</p>
                ) : (
                    <div className="space-y-3">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="rounded-xl border border-gray-100 dark:border-dark-border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <p className="text-xs font-mono text-gray-500">{order._id}</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{new Date(order.createdAt).toLocaleString()}</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{order.orderItems?.length || 0} items</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{formatINR(order.totalPrice)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded ${order.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {order.isPaid ? 'Paid' : 'Unpaid'}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded ${order.isDelivered ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {order.isDelivered ? 'Delivered' : 'Processing'}
                                    </span>
                                    {order.isCancelled ? (
                                        <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">Cancelled</span>
                                    ) : null}
                                    <Link to={`/orders/${order._id}`} className="text-sm font-semibold text-primary-600 hover:underline">Open</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Account;
