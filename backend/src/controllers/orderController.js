import Order from '../models/orderModel.js';
import Book from '../models/bookModel.js';
import { parsePagination } from '../utils/query.js';

const COUPONS = {
    SAVE10: 10,
    WELCOME15: 15,
    BOOK20: 20,
};

const applyCouponDiscount = (subtotal, couponCode) => {
    const code = String(couponCode || '').trim().toUpperCase();
    if (!code) {
        return { code: '', discount: 0 };
    }

    const percent = COUPONS[code];
    if (!percent) {
        return null;
    }

    const discount = Number(((subtotal * percent) / 100).toFixed(2));
    return { code, discount };
};




const addOrderItems = async (req, res, next) => {
    const decrementedItems = [];
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            taxPrice = 0,
            shippingPrice = 0,
            couponCode = '',
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            res.status(400);
            throw new Error('No order items');
        }

        const normalizedOrderItems = [];
        let subtotal = 0;

        const uniqueBookIds = [...new Set(orderItems.map((item) => String(item.book)))];
        const books = await Book.find({ _id: { $in: uniqueBookIds } }).lean();
        const bookMap = new Map(books.map((book) => [String(book._id), book]));

        for (const item of orderItems) {
            const book = bookMap.get(String(item.book));
            if (!book) {
                res.status(404);
                throw new Error(`Book not found for item: ${item.name || item.book}`);
            }

            const qty = Number(item.qty || 0);
            if (qty <= 0) {
                res.status(400);
                throw new Error(`Invalid quantity for "${book.title}"`);
            }

            normalizedOrderItems.push({
                name: book.title,
                qty,
                image: book.image,
                price: book.price,
                book: book._id,
            });

            subtotal += book.price * qty;
        }

        const couponResult = applyCouponDiscount(subtotal, couponCode);
        if (couponResult === null) {
            res.status(400);
            throw new Error('Invalid coupon code');
        }

        const itemsPrice = Number(subtotal.toFixed(2));
        const discountPrice = couponResult.discount;
        const tax = Number(taxPrice || 0);
        const shipping = Number(shippingPrice || 0);
        const totalPrice = Number((itemsPrice - discountPrice + tax + shipping).toFixed(2));

        for (const item of normalizedOrderItems) {
            const updated = await Book.findOneAndUpdate(
                { _id: item.book, countInStock: { $gte: item.qty } },
                { $inc: { countInStock: -item.qty } },
                { new: true }
            );

            if (!updated) {
                res.status(400);
                throw new Error(`Insufficient stock for "${item.name}"`);
            }

            decrementedItems.push(item);
        }

        const order = new Order({
            orderItems: normalizedOrderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            couponCode: couponResult.code,
            discountPrice,
            itemsPrice,
            taxPrice: tax,
            shippingPrice: shipping,
            totalPrice,
        });

        const createdOrder = await order.save();
        if (!createdOrder?._id) {
            res.status(500);
            throw new Error('Order created but ID was not returned');
        }

        res.status(201).json({
            ...createdOrder.toObject(),
            orderId: createdOrder._id,
        });
    } catch (error) {
        if (decrementedItems.length > 0) {
            await Promise.all(
                decrementedItems.map((item) =>
                    Book.updateOne({ _id: item.book }, { $inc: { countInStock: item.qty } })
                )
            );
        }
        next(error);
    }
};




const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        const isOwner =
            order?.user &&
            order?.user?._id &&
            req.user?._id &&
            order.user._id.equals(req.user._id);

        if (order && (req.user.isAdmin || isOwner)) {
            res.json(order);
        } else {
            res.status(404);
            throw new Error('Order not found');
        }
    } catch (error) {
        next(error);
    }
};




const updateOrderToPaid = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        if (order.isCancelled) {
            res.status(400);
            throw new Error('Cancelled order cannot be paid');
        }

        const isOwner = order.user.equals(req.user._id);
        if (!req.user.isAdmin && !isOwner) {
            res.status(403);
            throw new Error('Not authorized to update this order');
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id || 'fake_payment_id',
            status: req.body.status || 'COMPLETED',
            update_time: req.body.update_time || Date.now(),
            email_address: req.body.email_address || req.user.email,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
};




const updateOrderToDelivered = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        if (order.isCancelled) {
            res.status(400);
            throw new Error('Cancelled order cannot be delivered');
        }

        order.isDelivered = true;
        order.deliveredAt = Date.now();
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
};




const cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        const isOwner = order.user.equals(req.user._id);
        if (!req.user.isAdmin && !isOwner) {
            res.status(403);
            throw new Error('Not authorized to cancel this order');
        }

        if (order.isCancelled) {
            res.status(400);
            throw new Error('Order is already cancelled');
        }

        if (order.isDelivered) {
            res.status(400);
            throw new Error('Delivered order cannot be cancelled');
        }

        if (!req.user.isAdmin && order.isPaid) {
            res.status(400);
            throw new Error('Paid order can only be cancelled by admin');
        }

        order.isCancelled = true;
        order.cancelledAt = Date.now();
        order.cancelReason = req.body.reason || '';

        for (const item of order.orderItems) {
            const book = await Book.findById(item.book);
            if (book) {
                book.countInStock += item.qty;
                await book.save();
            }
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
};




const getMyOrders = async (req, res, next) => {
    try {
        const usePagination = req.query.paginate === 'true' || req.query.page || req.query.limit;
        const filter = { user: req.user._id };

        if (usePagination) {
            const { page, limit, skip } = parsePagination(req.query);
            const [total, orders] = await Promise.all([
                Order.countDocuments(filter),
                Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            ]);

            res.json({
                items: orders,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            });
            return;
        }

        const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
        res.json(orders);
    } catch (error) {
        next(error);
    }
};




const getOrders = async (req, res, next) => {
    try {
        const usePagination = req.query.paginate === 'true' || req.query.page || req.query.limit;

        if (usePagination) {
            const { page, limit, skip } = parsePagination(req.query);
            const [total, orders] = await Promise.all([
                Order.countDocuments({}),
                Order.find({})
                    .populate('user', 'id name email')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
            ]);

            res.json({
                items: orders,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            });
            return;
        }

        const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 }).lean();
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

export {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    cancelOrder,
    getMyOrders,
    getOrders,
};
