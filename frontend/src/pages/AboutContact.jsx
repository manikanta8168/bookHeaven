import { useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

const AboutContact = () => {
    const whatsappUrl = 'https://wa.me/919032729367?text=Hi%2C%20I%20need%20help%20with%20my%20order.';
    const [sent, setSent] = useState(false);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const text = `New Contact Message:%0AName: ${encodeURIComponent(
            `${form.firstName} ${form.lastName}`.trim()
        )}%0AEmail: ${encodeURIComponent(form.email)}%0AMessage: ${encodeURIComponent(form.message)}`;
        const submitUrl = `https://wa.me/919032729367?text=${text}`;
        window.open(submitUrl, '_blank');
        setSent(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {}
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">About BookHeaven</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                        Founded in 2026, BookHeaven has grown from a small local bookshop to a premier online destination for literature lovers worldwide. We believe that the right book can change a life, spark a movement, or simply provide a perfect escape.
                    </p>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                        Our expertly curated collection spans every genre, from timeless classics to modern masterpieces. We partner with independent publishers and renowned authors to bring you stories that matter.
                    </p>
                    <img
                        src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop"
                        alt="Library"
                        className="rounded-2xl shadow-xl w-full h-64 object-cover"
                    />
                </div>

                {}
                <div className="bg-white dark:bg-dark-surface p-10 rounded-3xl shadow-lg border border-gray-100 dark:border-dark-border">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Get in Touch</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex mb-6 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                        Chat Us on WhatsApp
                    </a>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                                <input
                                    type="text"
                                    value={form.firstName}
                                    onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={form.lastName}
                                    onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                            <textarea
                                rows="4"
                                value={form.message}
                                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-xl bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                required
                            ></textarea>
                        </div>
                        <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                            Send Message
                        </button>
                        {sent && (
                            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
                                Message sent successfully. Our support team will contact you soon.
                            </div>
                        )}
                    </form>

                    <div className="mt-10 pt-8 border-t border-gray-100 dark:border-dark-border grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="flex flex-col items-center text-center">
                            <MapPin className="h-6 w-6 text-primary-500 mb-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Visit Us</span>
                            <span className="text-xs text-gray-500 mt-1">LPU, Jalandhar, Punjab, India</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <Phone className="h-6 w-6 text-primary-500 mb-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">WhatsApp</span>
                            <span className="text-xs text-gray-500 mt-1">Contact Support</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <Mail className="h-6 w-6 text-primary-500 mb-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Email Us</span>
                            <span className="text-xs text-gray-500 mt-1">support@bookheaven.com</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutContact;
