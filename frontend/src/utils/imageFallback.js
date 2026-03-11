export const FALLBACK_BOOK_IMAGE =
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600';

export const handleBookImageError = (event) => {
    const img = event.currentTarget;
    img.onerror = null;
    img.src = FALLBACK_BOOK_IMAGE;
};
