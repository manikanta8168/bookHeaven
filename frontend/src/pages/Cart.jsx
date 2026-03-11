import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/useCartStore';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useState } from 'react';
import api from '../lib/api';
import { safeReadJSON } from '../utils/storage';
import { handleBookImageError } from '../utils/imageFallback';
import { formatINR } from '../utils/currency';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, addToCart, removeFromCart, clearCart } = useCartStore();
    const userInfo = useAuthStore((state) => state.userInfo);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(localStorage.getItem('paymentMethod') || 'Cash on Delivery');
    const [couponCode, setCouponCode] = useState('');
    const [shippingAddress, setShippingAddress] = useState(
        safeReadJSON('shippingAddress', {
            address: '',
            city: '',
            postalCode: '',
            country: '',
        })
    );

    const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
    const couponPercents = { SAVE10: 10, WELCOME15: 15, BOOK20: 20 };
    const normalizedCoupon = couponCode.trim().toUpperCase();
    const discount = couponPercents[normalizedCoupon]
        ? Number(((subtotal * couponPercents[normalizedCoupon]) / 100).toFixed(2))
        : 0;
    const total = Number((subtotal - discount).toFixed(2));

    const checkoutHandler = async () => {
        if (!userInfo) {
            navigate('/login?redirect=cart');
            return;
        }

        if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
            alert('Please fill in your shipping address before placing the order.');
            return;
        }

        try {
            setLoading(true);
            
            await new Promise(resolve => setTimeout(resolve, 1500));

            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await api.post(
                '/orders',
                {
                    orderItems: cartItems.map(item => ({
                        name: item.title,
                        qty: item.qty,
                        image: item.image,
                        price: item.price,
                        book: item._id
                    })),
                    shippingAddress,
                    paymentMethod,
                    couponCode: normalizedCoupon,
                    itemsPrice: subtotal,
                    taxPrice: 0,
                    shippingPrice: 0,
                    totalPrice: total,
                }, config
            );

            localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
            localStorage.setItem('paymentMethod', paymentMethod);
            clearCart();
            const orderId = data?._id || data?.orderId || data?.id;
            if (!orderId) {
                throw new Error('Order was placed but order id is missing in response');
            }
            navigate(`/order-success/${orderId}`);
        } catch (error) {
            console.error(error);
            alert(error?.response?.data?.message || error.message || 'Error placing order');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen flex flex-col items-center justify-center">
                <div className="bg-white dark:bg-dark-surface p-10 rounded-2xl shadow-sm text-center max-w-lg w-full border border-gray-100 dark:border-dark-border">
                    <ShoppingBag className="h-20 w-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Looks like you haven't added any books to your cart yet.</p>
                    <Link to="/shop" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-full font-medium inline-flex items-center gap-2 transition-colors">
                        Start Shopping <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
                        <ul className="divide-y divide-gray-100 dark:divide-dark-border">
                            {cartItems.map((item) => (
                                <li key={item._id} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                                    <div className="w-24 h-32 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                        <img src={item.image} alt={item.title} onError={handleBookImageError} className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-1 text-center sm:text-left">
                                        <Link to={`/book/${item._id}`} className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary-600 transition-colors">
                                            {item.title}
                                        </Link>
                                        <p className="text-gray-500 dark:text-gray-400 mt-1">{item.author}</p>
                                        <div className="text-primary-600 font-bold mt-2">{formatINR(item.price)}</div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <select
                                            value={item.qty}
                                            onChange={(e) => addToCart({ ...item, qty: Number(e.target.value) })}
                                            className="border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-white rounded-lg px-3 py-2 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            {[...Array(Math.max(item.countInStock || 1, 1)).keys()].map(x => (
                                                <option key={x + 1} value={x + 1}>{x + 1}</option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Shipping Address</h2>
                        <div className="space-y-3 mb-6">
                            <input
                                value={shippingAddress.address}
                                onChange={(e) => setShippingAddress((prev) => ({ ...prev, address: e.target.value }))}
                                placeholder="Street Address"
                                className="w-full border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-white rounded-lg px-3 py-2 shadow-sm"
                            />
                            <input
                                value={shippingAddress.city}
                                onChange={(e) => setShippingAddress((prev) => ({ ...prev, city: e.target.value }))}
                                placeholder="City"
                                className="w-full border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-white rounded-lg px-3 py-2 shadow-sm"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    value={shippingAddress.postalCode}
                                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, postalCode: e.target.value }))}
                                    placeholder="Postal Code"
                                    className="w-full border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-white rounded-lg px-3 py-2 shadow-sm"
                                />
                                <input
                                    value={shippingAddress.country}
                                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, country: e.target.value }))}
                                    placeholder="Country"
                                    className="w-full border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-white rounded-lg px-3 py-2 shadow-sm"
                                />
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Cash on Delivery"
                                        checked={paymentMethod === 'Cash on Delivery'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Cash on Delivery (COD)</span>
                                </label>
                                <label className="flex items-center gap-2 border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Online Payment"
                                        checked={paymentMethod === 'Online Payment'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Online Payment</span>
                                </label>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Coupon Code</label>
                            <input
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="SAVE10 / WELCOME15 / BOOK20"
                                className="w-full border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-white rounded-lg px-3 py-2 shadow-sm"
                            />
                            {couponCode && !couponPercents[normalizedCoupon] ? (
                                <p className="text-xs text-amber-600 mt-1">Coupon will be validated at checkout.</p>
                            ) : null}
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})</span>
                                <span>{formatINR(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Tax</span>
                                <span>{formatINR(0)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Discount</span>
                                <span>- {formatINR(discount)}</span>
                            </div>
                            <div className="border-t border-gray-100 dark:border-dark-border pt-4 mt-4 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                                <span className="text-2xl font-bold text-primary-600">{formatINR(total)}</span>
                            </div>
                        </div>

                        <button
                            onClick={checkoutHandler}
                            disabled={loading}
                            className={`w-full flex justify-center items-center py-4 rounded-xl font-bold text-white transition-all ${loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                                }`}
                        >
                            {loading ? 'Processing...' : userInfo ? 'Proceed to Checkout' : 'Login to Checkout'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
