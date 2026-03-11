import { MessageCircle } from 'lucide-react';

const WhatsAppFloat = () => {
    const whatsappUrl = 'https://wa.me/919032729367?text=Hi%2C%20I%20need%20help%20with%20my%20order.';

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat on WhatsApp"
            className="fixed bottom-5 right-5 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-xl transition-all hover:scale-105"
            title="Chat with us on WhatsApp"
        >
            <MessageCircle className="h-6 w-6" />
        </a>
    );
};

export default WhatsAppFloat;
