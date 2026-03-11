import { Loader2 } from 'lucide-react';

const Loader = ({ className = "" }) => {
    return (
        <div className={`flex justify-center items-center ${className}`}>
            <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
        </div>
    );
};

export default Loader;
