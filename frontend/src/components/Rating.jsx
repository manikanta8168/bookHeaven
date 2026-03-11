import { Star, StarHalf } from 'lucide-react';

const Rating = ({ value, text, color = "text-yellow-400" }) => {
    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {[1, 2, 3, 4, 5].map((index) => (
                    <span key={index}>
                        {value >= index ? (
                            <Star className={`h-4 w-4 fill-current ${color}`} />
                        ) : value >= index - 0.5 ? (
                            <StarHalf className={`h-4 w-4 fill-current ${color}`} />
                        ) : (
                            <Star className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                        )}
                    </span>
                ))}
            </div>
            {text && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{text}</span>}
        </div>
    );
};

export default Rating;
