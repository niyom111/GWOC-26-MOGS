import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

export const PointerHighlight = ({
    children,
    className,
    radius = 200,
}: {
    children: React.ReactNode;
    className?: string;
    radius?: number;
}) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        // Only enable on desktop
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 768);
        };

        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        if (!isDesktop) return;
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    if (!isDesktop) {
        return <div className={cn("relative inline-block", className)}>{children}</div>;
    }

    return (
        <div
            className={cn(
                "group relative inline-flex overflow-hidden rounded-lg transition-colors", // slight transition
                className
            )}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative z-10">{children}</div>

            <motion.div
                className="pointer-events-none absolute -inset-px rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              ${radius}px circle at ${mouseX}px ${mouseY}px,
              rgba(163, 93, 54, 0.4),
              transparent 80%
            )
          `,
                }}
            />
            {/* Optional: Add a lighter/white inner glow for intensity */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              ${radius / 2}px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 255, 255, 0.1),
              transparent 80%
            )
          `,
                }}
            />
        </div>
    );
};
