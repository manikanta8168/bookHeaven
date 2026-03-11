import { create } from 'zustand';
import { safeReadJSON } from '../utils/storage';

const useAuthStore = create((set) => ({
    userInfo: safeReadJSON('userInfo', null),
    login: (data) => {
        localStorage.setItem('userInfo', JSON.stringify(data));
        set({ userInfo: data });
    },
    logout: () => {
        localStorage.removeItem('userInfo');
        set({ userInfo: null });
    },
}));

export default useAuthStore;
