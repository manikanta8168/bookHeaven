import { create } from 'zustand';
import { safeReadJSON } from '../utils/storage';

const isValidCartItem = (item) =>
    item &&
    typeof item === 'object' &&
    item._id !== null &&
    item._id !== undefined;

const sanitizeCartItems = (items) => {
    if (!Array.isArray(items)) return [];

    return items
        .filter(isValidCartItem)
        .map((item) => ({
            ...item,
            qty: Number(item.qty) > 0 ? Number(item.qty) : 1,
        }));
};

const persistCartItems = (items) => {
    localStorage.setItem('cartItems', JSON.stringify(items));
};

const readInitialCartItems = () => {
    const sanitized = sanitizeCartItems(safeReadJSON('cartItems', []));
    persistCartItems(sanitized);
    return sanitized;
};

const useCartStore = create((set, get) => ({
    cartItems: readInitialCartItems(),
    addToCart: (item) => {
        if (!isValidCartItem(item)) return;

        const cartItems = sanitizeCartItems(get().cartItems);
        const existItem = cartItems.find((x) => x._id === item._id);
        const normalizedItem = {
            ...item,
            qty: Number(item.qty) > 0 ? Number(item.qty) : 1,
        };

        let newItems;
        if (existItem) {
            newItems = cartItems.map((x) =>
                x._id === existItem._id ? normalizedItem : x
            );
        } else {
            newItems = [...cartItems, normalizedItem];
        }

        persistCartItems(newItems);
        set({ cartItems: newItems });
    },
    removeFromCart: (id) => {
        const newItems = sanitizeCartItems(get().cartItems).filter((x) => x._id !== id);
        persistCartItems(newItems);
        set({ cartItems: newItems });
    },
    clearCart: () => {
        localStorage.removeItem('cartItems');
        set({ cartItems: [] });
    }
}));

export default useCartStore;
