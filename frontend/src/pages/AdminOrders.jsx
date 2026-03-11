import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Package, IndianRupee, Truck, Ban } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import { formatINR } from '../utils/currency';

const statusPill = (label, kind) => {
    const map = {
        success: 'bg-emerald-100 text-emerald-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        muted: 'bg-gray-100 text-gray-700',
    };
    return <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${map[kind]}`}>{label}</span>;
};

const AdminOrders = () => {
    const navigate = useNavigate();
    const { userInfo } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const authConfig = userInfo
        ? { headers: { Authorization: `Bearer ${userInfo.token}` } }
        : {};

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/orders?paginate=true&limit=200', authConfig);
            setOrders(Array.isArray(data) ? data : (data.items || []));
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
        fetchOrders();
    }, [userInfo, navigate]);

    const markPaid = async (orderId) => {
        try {
            await api.put(`/orders/${orderId}/pay`, {}, authConfig);
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to mark as paid');
        }
    };

    const markDelivered = async (orderId) => {
        try {
            await api.put(`/orders/${orderId}/deliver`, {}, authConfig);
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to mark as delivered');
        }
    };

    const cancelOrder = async (orderId) => {
        const reason = window.prompt('Reason for cancellation (optional):', 'Cancelled by admin');
        try {
            await api.put(`/orders/${orderId}/cancel`, { reason: reason || 'Cancelled by admin' }, authConfig);
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel order');
        }
    };

    const filteredOrders = useMemo(() => {
        return orders
            .filter((order) => {
                const term = search.toLowerCase().trim();
                const matchesSearch = term
                    ? [
                        order._id,
                        order.user?.name,
                        order.user?.email,
                        ...(order.orderItems || []).map((item) => item.name)
                    ]
                        .filter(Boolean)
                        .some((field) => String(field).toLowerCase().includes(term))
                    : true;

                const matchesStatus =
                    statusFilter === 'all' ? true :
                        statusFilter === 'cancelled' ? order.isCancelled :
                            statusFilter === 'paid' ? order.isPaid :
                                statusFilter === 'unpaid' ? !order.isPaid :
                                    statusFilter === 'delivered' ? order.isDelivered :
                                        !order.isDelivered;

                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                if (sortBy === 'totalAsc') return Number(a.totalPrice || 0) - Number(b.totalPrice || 0);
                if (sortBy === 'totalDesc') return Number(b.totalPrice || 0) - Number(a.totalPrice || 0);
                if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            });
    }, [orders, search, statusFilter, sortBy]);

    const metrics = useMemo(() => {
        const paidRevenueOrders = filteredOrders.filter((order) => order.isPaid && !order.isCancelled);
        const revenue = paidRevenueOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
        return {
            total: filteredOrders.length,
            paid: paidRevenueOrders.length,
            delivered: filteredOrders.filter((o) => o.isDelivered).length,
            cancelled: filteredOrders.filter((o) => o.isCancelled).length,
            revenue,
        };
    }, [filteredOrders]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
            <div className="rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-indigo-900 p-7 md:p-8 text-white shadow-2xl mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold">Manage Orders</h1>
                        <p className="text-slate-200 mt-1">Track payments, delivery, cancellations, and fulfillment updates.</p>
                    </div>
                    <Link to="/admin/books" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl font-semibold transition-colors">
                        <Package className="h-4 w-4" />
                        Manage Books
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
                <div className="bg-white rounded-xl border border-gray-200 p-3"><p className="text-xs text-gray-500">Orders</p><p className="text-xl font-extrabold">{metrics.total}</p></div>
                <div className="bg-white rounded-xl border border-gray-200 p-3"><p className="text-xs text-gray-500">Paid</p><p className="text-xl font-extrabold">{metrics.paid}</p></div>
                <div className="bg-white rounded-xl border border-gray-200 p-3"><p className="text-xs text-gray-500">Delivered</p><p className="text-xl font-extrabold">{metrics.delivered}</p></div>
                <div className="bg-white rounded-xl border border-gray-200 p-3"><p className="text-xs text-gray-500">Cancelled</p><p className="text-xl font-extrabold">{metrics.cancelled}</p></div>
                <div className="bg-white rounded-xl border border-gray-200 p-3"><p className="text-xs text-gray-500 inline-flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />Revenue</p><p className="text-xl font-extrabold">{formatINR(metrics.revenue)}</p></div>
            </div>

            {loading ? <div>Loading orders...</div> : null}
            {error ? <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div> : null}

            {!loading && !error && (
                <div className="space-y-4">
                    <div className="bg-white shadow-sm rounded-2xl border border-gray-200 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="relative">
                                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search order/user/item"
                                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 bg-gray-50"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 rounded-xl border border-gray-300 bg-gray-50"
                            >
                                <option value="all">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                                <option value="delivered">Delivered</option>
                                <option value="undelivered">Undelivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 rounded-xl border border-gray-300 bg-gray-50"
                            >
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                                <option value="totalAsc">Total Low to High</option>
                                <option value="totalDesc">Total High to Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-slate-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Order</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Customer</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Items</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Total</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <tr key={order._id} className="border-b border-gray-100 hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-4 text-sm font-mono text-gray-500">{order._id.slice(0, 10)}...</td>
                                            <td className="px-4 py-4 text-sm">
                                                <div className="font-semibold text-gray-800">{order.user?.name || 'Unknown'}</div>
                                                <div className="text-gray-500">{order.user?.email || 'N/A'}</div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">{order.orderItems?.length || 0}</td>
                                            <td className="px-4 py-4 text-sm font-bold text-gray-900">{formatINR(order.totalPrice)}</td>
                                            <td className="px-4 py-4 text-sm">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {order.isPaid ? statusPill('Paid', 'success') : statusPill('Unpaid', 'muted')}
                                                    {order.isDelivered ? statusPill('Delivered', 'info') : statusPill('Pending', 'muted')}
                                                    {order.isCancelled ? statusPill('Cancelled', 'danger') : null}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setSelectedOrder(order)} className="px-3 py-1.5 rounded-lg bg-gray-700 text-white text-xs font-semibold">Details</button>
                                                    <button onClick={() => markPaid(order._id)} disabled={order.isPaid || order.isCancelled} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold disabled:bg-gray-300">Paid</button>
                                                    <button onClick={() => markDelivered(order._id)} disabled={order.isDelivered || order.isCancelled} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold disabled:bg-gray-300">Delivered</button>
                                                    <button onClick={() => cancelOrder(order._id)} disabled={order.isCancelled || order.isDelivered} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold disabled:bg-gray-300">Cancel</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {selectedOrder && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-3xl bg-white rounded-2xl border border-gray-200 max-h-[90vh] overflow-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-800">Close</button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div><span className="font-semibold">Order ID:</span> {selectedOrder._id}</div>
                                <div><span className="font-semibold">User:</span> {selectedOrder.user?.name || 'Unknown'}</div>
                                <div><span className="font-semibold">Email:</span> {selectedOrder.user?.email || 'N/A'}</div>
                                <div><span className="font-semibold">Payment:</span> {selectedOrder.isPaid ? 'Paid' : 'Not Paid'}</div>
                                <div><span className="font-semibold">Delivery:</span> {selectedOrder.isDelivered ? 'Delivered' : 'Pending'}</div>
                                <div><span className="font-semibold">Cancelled:</span> {selectedOrder.isCancelled ? 'Yes' : 'No'}</div>
                                <div><span className="font-semibold">Coupon:</span> {selectedOrder.couponCode || 'None'}</div>
                                <div><span className="font-semibold">Discount:</span> {formatINR(selectedOrder.discountPrice)}</div>
                                <div><span className="font-semibold">Total:</span> {formatINR(selectedOrder.totalPrice)}</div>
                            </div>
                            <div className="text-sm">
                                <h3 className="font-semibold mb-2">Shipping Address</h3>
                                <p className="text-gray-600">
                                    {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}, {selectedOrder.shippingAddress?.country}
                                </p>
                            </div>
                            <div className="text-sm">
                                <h3 className="font-semibold mb-2">Items</h3>
                                <div className="space-y-2">
                                    {(selectedOrder.orderItems || []).map((item) => (
                                        <div key={`${selectedOrder._id}-${item.book}`} className="flex justify-between border border-gray-100 rounded-lg p-3">
                                            <span>{item.name} x {item.qty}</span>
                                            <span>{formatINR(item.price)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {selectedOrder.cancelReason ? (
                                <div className="text-sm">
                                    <h3 className="font-semibold mb-2 inline-flex items-center gap-1"><Ban className="h-4 w-4 text-red-500" />Cancel Reason</h3>
                                    <p className="text-red-600">{selectedOrder.cancelReason}</p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
