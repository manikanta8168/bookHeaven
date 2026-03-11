import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import { formatINR } from '../utils/currency';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useAuthStore();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);

    const config = userInfo
        ? { headers: { Authorization: `Bearer ${userInfo.token}` } }
        : {};

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }

        const fetchOrder = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/orders/${id}`, config);
                setOrder(data);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, userInfo, navigate]);

    const cancelOrder = async () => {
        const reason = window.prompt('Reason for cancellation (optional):', '');
        try {
            setUpdating(true);
            const { data } = await api.put(`/orders/${id}/cancel`, { reason: reason || '' }, config);
            setOrder(data);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel order');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="max-w-5xl mx-auto px-4 py-10">Loading order...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Details</h1>
                <Link to="/account" className="text-primary-600 hover:underline">Back to account</Link>
            </div>

            {error ? <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div> : null}

            {order && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-6">
                        <p className="text-sm text-gray-500 font-mono mb-3">{order._id}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <p><span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
                            <p><span className="font-semibold">Payment:</span> {order.isPaid ? 'Paid' : 'Not Paid'}</p>
                            <p><span className="font-semibold">Delivery:</span> {order.isDelivered ? 'Delivered' : 'Processing'}</p>
                            <p><span className="font-semibold">Status:</span> {order.isCancelled ? 'Cancelled' : 'Active'}</p>
                            <p><span className="font-semibold">Payment Method:</span> {order.paymentMethod || 'N/A'}</p>
                            <p><span className="font-semibold">Coupon:</span> {order.couponCode || 'None'}</p>
                            <p><span className="font-semibold">Discount:</span> {formatINR(order.discountPrice)}</p>
                            <p><span className="font-semibold">Total:</span> {formatINR(order.totalPrice)}</p>
                        </div>
                        {!order.isCancelled && !order.isDelivered ? (
                            <button
                                onClick={cancelOrder}
                                disabled={updating}
                                className="mt-4 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:bg-gray-400"
                            >
                                {updating ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        ) : null}
                    </div>

                    <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-3">Shipping Address</h2>
                        <p className="text-gray-700 dark:text-gray-300">
                            {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-3">Items</h2>
                        <div className="space-y-3">
                            {(order.orderItems || []).map((item, index) => (
                                <div key={`${item.book}-${index}`} className="flex items-center justify-between border border-gray-100 dark:border-dark-border rounded-lg p-3">
                                    <div className="flex items-center gap-3">
                                        <img src={item.image} alt={item.name} className="w-10 h-12 rounded object-cover" />
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                                        </div>
                                    </div>
                                    <p className="font-semibold">{formatINR(item.price)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetails;
