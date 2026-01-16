import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { CoffeeItem } from '../types';

interface MenuProductCardProps {
    item: any; // Allow flexible item types (MenuItem or CoffeeItem)
    image?: string; // Allow override image (e.g. placeholder)
    onAddToCart: (item: any) => void;
    index: number;
}

const MenuProductCard: React.FC<MenuProductCardProps> = ({ item, image, onAddToCart, index }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const displayImage = image || item.image || '';

    // Toggle flip on image click
    const handleImageClick = () => {
        setIsFlipped(!isFlipped);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsFlipped(!isFlipped);
        }
    };

    const handleAddToCartClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddToCart(item);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group"
        >
            {/* Flip Container */}
            <div
                className="relative mb-6 cursor-pointer"
                style={{ perspective: '1200px' }}
                onClick={handleImageClick}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${item.name}`}
            >
                <div
                    className="relative w-full aspect-[4/5] md:aspect-[3/4]"
                    style={{
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                >
                    {/* Front: Image */}
                    <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(0deg)',
                        }}
                    >
                        <div className="w-full h-full overflow-hidden bg-zinc-100">
                            <img
                                src={displayImage}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Badges Overlay - Front Only */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                {item.badges?.map((badge: string) => (
                                    <span
                                        key={badge}
                                        className={`text-[9px] px-2 py-1 uppercase tracking-widest font-bold text-white shadow-sm ${badge === 'POPULAR' ? 'bg-amber-600' :
                                            badge === 'NEW' ? 'bg-emerald-700' :
                                                'bg-black'
                                            }`}
                                    >
                                        {badge}
                                    </span>
                                ))}
                            </div>

                        </div>
                    </div>

                    {/* Back: Details Overlay */}
                    <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                        }}
                    >
                        <div className="w-full h-full relative overflow-hidden">
                            {/* Blurred Background */}
                            <div
                                className="absolute inset-0 w-full h-full"
                                style={{
                                    backgroundImage: `url(${displayImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    filter: 'blur(12px)',
                                    transform: 'scale(1.1)',
                                }}
                            />
                            {/* Dark Overlay */}
                            <div
                                className="absolute inset-0 w-full h-full"
                                style={{ backgroundColor: 'rgba(34, 34, 34, 0.75)' }}
                            />

                            {/* Content */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-center text-left">
                                <h3 className="text-3xl font-serif italic text-[#f2f2f2] mb-2 leading-tight">
                                    {item.name}
                                </h3>
                                <p className="text-sm font-sans text-[#f2f2f2] opacity-80 mb-4 tracking-widest uppercase">
                                    ₹{item.price}
                                </p>

                                <div className="w-8 h-px bg-[#f2f2f2]/20 mb-4" />

                                <p className="text-sm font-serif italic text-[#f2f2f2] leading-relaxed opacity-90">
                                    {item.description}
                                </p>

                                {item.caffeine && (
                                    <div className="mt-6">
                                        <span className="text-[10px] uppercase tracking-widest text-[#f2f2f2]/60 block mb-1">Caffeine</span>
                                        <span className="text-sm font-sans text-[#f2f2f2]">{item.caffeine}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Static Footer (Title, Price, Add to Cart) */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-serif italic mb-1 leading-tight group-hover:text-[#A35D36] transition-colors duration-300">
                        {item.name}
                    </h3>
                    <p className="text-sm font-sans font-bold text-zinc-900">
                        ₹{item.price}
                    </p>
                </div>

                <button
                    onClick={handleAddToCartClick}
                    className="p-3 rounded-full bg-zinc-900 text-white hover:bg-[#A35D36] transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 group/btn"
                    aria-label="Add to cart"
                >
                    <ShoppingCart className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
};

export default MenuProductCard;
