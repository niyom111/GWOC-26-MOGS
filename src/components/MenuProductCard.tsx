import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

interface MenuProductCardProps {
    item: any; // Allow flexible item types (MenuItem or CoffeeItem)
    image?: string; // Allow override image (e.g. placeholder)
    onAddToCart: (item: any) => void;
    index: number;
}

const MenuProductCard: React.FC<MenuProductCardProps> = ({ item, image, onAddToCart, index }) => {
    const displayImage = image || item.image || '';

    const handleAddToCartClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddToCart(item);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.3 }}
            className="group flex flex-col h-full cursor-pointer"
        >
            {/* Image Container - Square, Hover Lifts & Rotates Slightly, No Zoom */}
            <div className="relative w-[85%] mx-auto aspect-square overflow-hidden mb-5 bg-[#e5e5e5] rounded-none transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:rotate-3 shadow-none group-hover:shadow-xl">
                <img
                    src={displayImage}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-none"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {item.badges?.map((badge: string) => (
                        <span
                            key={badge}
                            className={`text-[9px] px-2 py-1 uppercase tracking-widest font-bold text-white shadow-sm rounded-sm ${badge === 'POPULAR' ? 'bg-amber-600' :
                                badge === 'NEW' ? 'bg-emerald-700' :
                                    'bg-black'
                                }`}
                        >
                            {badge}
                        </span>
                    ))}
                </div>
            </div>

            {/* Content Container */}
            <div className="flex flex-col w-[85%] mx-auto">
                {/* Header: Name & Price */}
                <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="text-4xl font-serif italic text-black leading-tight group-hover:text-[#B5693E] transition-colors duration-300">
                        {item.name}
                    </h3>
                    <span className="text-2xl font-sans font-medium text-black shrink-0">
                        ₹{item.price}
                    </span>
                </div>

                {/* Description */}
                <p className="text-base font-sans text-zinc-600 font-light leading-relaxed mb-6 line-clamp-2">
                    {item.description || item.category || item.name}
                </p>

                {/* Footer: Add to Cart Button */}
                <div className="mt-auto pt-4">
                    <button
                        onClick={handleAddToCartClick}
                        className="w-full py-3 border border-black/20 text-black text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-colors duration-300 hover:bg-black hover:text-white group/btn"
                        aria-label="Add to cart"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default MenuProductCard;
