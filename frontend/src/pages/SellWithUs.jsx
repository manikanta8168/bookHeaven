import { useState } from 'react';
import api from '../lib/api';

const SellWithUs = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        organization: '',
        bookTitle: '',
        authorName: '',
        genre: '',
        publishYear: '',
        description: '',
        sampleLink: '',
        expectedPrice: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            setLoading(true);
            const payload = {
                ...form,
                publishYear: form.publishYear ? Number(form.publishYear) : null,
                expectedPrice: form.expectedPrice ? Number(form.expectedPrice) : 0,
            };
            const { data } = await api.post('/collab', payload);
            setMessage(data.message || 'Request submitted successfully.');
            setForm({
                name: '',
                email: '',
                phone: '',
                organization: '',
                bookTitle: '',
                authorName: '',
                genre: '',
                publishYear: '',
                description: '',
                sampleLink: '',
                expectedPrice: '',
            });
        } catch (err) {
            setMessage(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Sell Your Book With Us</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Are you an author or publisher? Submit your published book details and collaborate with BookHeaven.
                </p>
            </div>

            <form onSubmit={onSubmit} className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl p-6 md:p-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name" value={form.name} onChange={onChange} placeholder="Your Name *" required className="px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
                    <input type="email" name="email" value={form.email} onChange={onChange} placeholder="Email *" required className="px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
                    <input name="phone" value={form.phone} onChange={onChange} placeholder="Phone *" required className="px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
                    <input name="organization" value={form.organization} onChange={onChange} placeholder="Publisher / Organization (optional)" className="px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="bookTitle" value={form.bookTitle} onChange={onChange} placeholder="Book Title *" required className="px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
                    <input name="authorName" value={form.authorName} onChange={onChange} placeholder="Author Name *" required className="px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
                    <input name="genre" value={form.genre} onChange={onChange} placeholder="Genre *" required className="px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
                    <input type="number" name="publishYear" value={form.publishYear} onChange={onChange} placeholder="Publish Year" className="px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="sampleLink" value={form.sampleLink} onChange={onChange} placeholder="Sample / Drive Link (optional)" className="px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
                    <input type="number" name="expectedPrice" value={form.expectedPrice} onChange={onChange} placeholder="Expected Price" className="px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
                </div>

                <textarea name="description" value={form.description} onChange={onChange} rows="5" placeholder="Book Description *" required className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />

                <div className="flex items-center justify-between gap-4">
                    <p className={`text-sm ${message.toLowerCase().includes('success') ? 'text-emerald-600' : 'text-red-600'}`}>
                        {message}
                    </p>
                    <button type="submit" disabled={loading} className="px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:bg-gray-400">
                        {loading ? 'Submitting...' : 'Submit Collaboration Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SellWithUs;
