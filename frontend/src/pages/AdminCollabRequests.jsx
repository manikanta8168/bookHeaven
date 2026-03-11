import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';

const AdminCollabRequests = () => {
    const navigate = useNavigate();
    const { userInfo } = useAuthStore();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const config = userInfo
        ? { headers: { Authorization: `Bearer ${userInfo.token}` } }
        : {};

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/collab?paginate=true&limit=200', config);
            setRequests(Array.isArray(data) ? data : (data.items || []));
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/admin/login');
            return;
        }
        fetchRequests();
    }, [userInfo, navigate]);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/collab/${id}`, { status }, config);
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update request');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Collaboration Requests</h1>
                <div className="flex gap-3">
                    <Link to="/admin/dashboard" className="text-primary-600 hover:underline">Dashboard</Link>
                    <Link to="/admin/books" className="text-primary-600 hover:underline">Books</Link>
                </div>
            </div>

            {loading ? <div>Loading requests...</div> : null}
            {error ? <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div> : null}

            {!loading && !error && (
                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600">No collaboration requests yet.</div>
                    ) : (
                        requests.map((item) => (
                            <div key={item._id} className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-5">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                                    <div>
                                        <h2 className="text-xl font-semibold">{item.bookTitle}</h2>
                                        <p className="text-sm text-gray-500">By {item.authorName} • {item.genre}</p>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 font-semibold uppercase">{item.status}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{item.description}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                                    <p><span className="font-semibold">Seller:</span> {item.name}</p>
                                    <p><span className="font-semibold">Email:</span> {item.email}</p>
                                    <p><span className="font-semibold">Phone:</span> {item.phone}</p>
                                    <p><span className="font-semibold">Org:</span> {item.organization || 'N/A'}</p>
                                    <p><span className="font-semibold">Year:</span> {item.publishYear || 'N/A'}</p>
                                    <p><span className="font-semibold">Expected Price:</span> {item.expectedPrice || 0}</p>
                                </div>
                                {['new', 'pending'].includes(item.status) ? (
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={() => updateStatus(item._id, 'contacted')} className="px-3 py-1.5 rounded bg-amber-500 text-white text-xs font-semibold">Mark Contacted</button>
                                        <button onClick={() => updateStatus(item._id, 'approved')} className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs font-semibold">Approve</button>
                                        <button onClick={() => updateStatus(item._id, 'rejected')} className="px-3 py-1.5 rounded bg-red-600 text-white text-xs font-semibold">Reject</button>
                                    </div>
                                ) : null}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminCollabRequests;
