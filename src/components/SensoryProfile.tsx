
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SensoryProfile: React.FC = () => {
    // 5 Axes: Body, Crema, Caffeine, Acidity, Bitterness
    // Scale 0-100
    // Rabuste: High Body, High Crema, Max Caffeine, Low Acidity, High Bitterness (Good kind)
    // Arabica: Med Body, Med Crema, Med Caffeine, High Acidity, Low Bitterness

    // Coordinates logic
    // Angle: -90 (top), -18 (top right), 54 (bottom right), 126 (bottom left), 198 (top left) 
    // Wait, 5 points = 72 degrees each.
    // 0 = Top (0, -r)
    // 1 = Top Right (sin(72)*r, -cos(72)*r)
    // 2 = Bottom Right (sin(144)*r, -cos(144)*r)
    // 3 = Bottom Left (sin(216)*r, -cos(216)*r)
    // 4 = Top Left (sin(288)*r, -cos(288)*r)

    const points = [
        { label: "Body", angle: 0 },
        { label: "Crema", angle: 72 },
        { label: "Caffeine", angle: 144 },
        { label: "Acidity", angle: 216 },
        { label: "Intensity", angle: 288 }
    ];

    const rabusteStats = [95, 90, 100, 20, 95]; // High everything except Acidity
    const arabicaStats = [60, 50, 45, 85, 40];  // Balanced/Acidic

    const calculatePoints = (stats: number[], radius: number) => {
        return stats.map((val, i) => {
            const angleRad = (points[i].angle - 90) * (Math.PI / 180);
            const r = (val / 100) * radius;
            const x = 150 + Math.cos(angleRad) * r; // Center 150, 150
            const y = 150 + Math.sin(angleRad) * r;
            return `${x},${y}`;
        }).join(" ");
    };

    const gridLevels = [25, 50, 75, 100];
    const maxRadius = 100;

    const [hoveredStat, setHoveredStat] = useState<string | null>(null);

    return (
        <section className="bg-[#0A0A0A] text-[#F9F8F4] py-32 border-y border-white/5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                {/* Left: Description */}
                <div>
                    <span className="text-xs font-sans uppercase tracking-[0.4em] text-[#CE2029] block mb-6">
                        Sensory Analysis
                    </span>
                    <h2 className="text-5xl md:text-7xl font-serif font-bold italic mb-8 leading-none">
                        The Shape<br />of Power.
                    </h2>
                    <p className="text-zinc-400 font-sans text-lg leading-relaxed mb-8 max-w-md">
                        Standard coffee aims for balance. We target extremes.
                        Massive body, thick iridescent crema, and low acidity for a punch
                        that feels like a physical impact.
                    </p>

                    {/* Legend */}
                    <div className="flex gap-8 text-xs font-sans uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#CE2029]" />
                            <span>Rabuste</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-white/30" />
                            <span className="text-zinc-500">Industry Avg</span>
                        </div>
                    </div>
                </div>

                {/* Right: Radar Chart */}
                <div className="relative flex items-center justify-center">
                    <svg viewBox="0 0 300 300" className="w-full max-w-[500px] overflow-visible">
                        {/* Grid Polygons */}
                        {gridLevels.map((level, i) => (
                            <polygon
                                key={i}
                                points={calculatePoints(Array(5).fill(level), maxRadius)}
                                fill="none"
                                stroke="white"
                                strokeOpacity={0.1}
                                strokeDasharray="4 4"
                            />
                        ))}

                        {/* Axes Lines */}
                        {points.map((p, i) => {
                            const angleRad = (p.angle - 90) * (Math.PI / 180);
                            const x = 150 + Math.cos(angleRad) * maxRadius;
                            const y = 150 + Math.sin(angleRad) * maxRadius;
                            return (
                                <line key={i} x1="150" y1="150" x2={x} y2={y} stroke="white" strokeOpacity={0.1} />
                            );
                        })}

                        {/* Arabica Shape */}
                        <motion.polygon
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                            points={calculatePoints(arabicaStats, maxRadius)}
                            fill="transparent"
                            stroke="white"
                            strokeOpacity={0.3}
                            strokeWidth="1.5"
                        />

                        {/* Rabuste Shape */}
                        <motion.polygon
                            initial={{ pathLength: 0, fillOpacity: 0 }}
                            whileInView={{ pathLength: 1, fillOpacity: 0.2 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            points={calculatePoints(rabusteStats, maxRadius)}
                            fill="#CE2029"
                            stroke="#CE2029"
                            strokeWidth="3"
                        />

                        {/* Labels & Interactive Dots */}
                        {points.map((p, i) => {
                            const angleRad = (p.angle - 90) * (Math.PI / 180);
                            // Label Position (pushed out further)
                            const lx = 150 + Math.cos(angleRad) * (maxRadius + 30);
                            const ly = 150 + Math.sin(angleRad) * (maxRadius + 30);

                            // Dot Position (Rabuste Value)
                            const r = (rabusteStats[i] / 100) * maxRadius;
                            const dx = 150 + Math.cos(angleRad) * r;
                            const dy = 150 + Math.sin(angleRad) * r;

                            const anchor = p.angle === 0 ? "middle" : p.angle < 180 ? "start" : "end";

                            return (
                                <g key={i} onMouseEnter={() => setHoveredStat(p.label)} onMouseLeave={() => setHoveredStat(null)}>
                                    {/* Label */}
                                    <text
                                        x={lx} y={ly}
                                        fill={hoveredStat === p.label ? "#CE2029" : "#666"}
                                        textAnchor={anchor}
                                        dominantBaseline="middle"
                                        className="text-[10px] uppercase font-sans tracking-widest transition-colors duration-300 cursor-default font-bold"
                                        style={{ fontSize: "10px" }}
                                    >
                                        {p.label}
                                    </text>

                                    {/* Interactive Dot */}
                                    {hoveredStat === p.label && (
                                        <g>
                                            <circle cx={dx} cy={dy} r="6" fill="#CE2029" fillOpacity="0.2" />
                                            <circle cx={dx} cy={dy} r="3" fill="#CE2029" />
                                            {/* Value Tooltip */}
                                            <text x={dx} y={dy - 15} textAnchor="middle" fill="#CE2029" fontSize="12" fontWeight="bold">
                                                {rabusteStats[i]}%
                                            </text>
                                        </g>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>
        </section>
    );
};

export default SensoryProfile;
