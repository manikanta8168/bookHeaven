import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const UserRoute = () => {
    const userInfo = useAuthStore((state) => state.userInfo);
    const location = useLocation();

    if (!userInfo) {
        const redirect = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/login?redirect=${redirect}`} replace />;
    }

    return <Outlet />;
};

export default UserRoute;
