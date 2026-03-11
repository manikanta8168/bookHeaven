import { Link } from 'react-router-dom';

const topicContent = {
    faq: {
        title: 'Frequently Asked Questions',
        items: [
            { q: 'How long does shipping take?', a: 'Standard shipping usually takes 3 to 7 business days.' },
            { q: 'Can I cancel my order?', a: 'Yes, before it is marked as shipped. Contact support quickly for help.' },
            { q: 'Do you have international shipping?', a: 'Yes, for selected countries. Rates are shown during checkout.' }
        ]
    },
    shipping: {
        title: 'Shipping Information',
        items: [
            { q: 'Standard Shipping', a: '3 to 7 business days for domestic orders.' },
            { q: 'Express Shipping', a: '1 to 2 business days where available.' },
            { q: 'Tracking', a: 'A tracking update is sent to your email after dispatch.' }
        ]
    },
    returns: {
        title: 'Returns & Refunds',
        items: [
            { q: 'Return Window', a: 'Returns are accepted within 14 days of delivery.' },
            { q: 'Book Condition', a: 'Books should be unused and in original condition.' },
            { q: 'Refund Time', a: 'Refunds are processed within 5 to 10 business days after inspection.' }
        ]
    }
};

const SupportPage = ({ topic = 'faq' }) => {
    const content = topicContent[topic] || topicContent.faq;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{content.title}</h1>

            <div className="space-y-4">
                {content.items.map((item) => (
                    <div key={item.q} className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-5">
                        <h2 className="font-semibold text-gray-900 dark:text-white mb-2">{item.q}</h2>
                        <p className="text-gray-600 dark:text-gray-300">{item.a}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                Need more help? Visit the <Link to="/contact" className="text-primary-600 hover:underline">contact page</Link>.
            </div>
        </div>
    );
};

export default SupportPage;
