import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const AdminRoute = () => {
    const userInfo = useAuthStore((state) => state.userInfo);
    const location = useLocation();

    if (!userInfo) {
        const redirect = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/admin/login?redirect=${redirect}`} replace />;
    }

    if (!userInfo.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
