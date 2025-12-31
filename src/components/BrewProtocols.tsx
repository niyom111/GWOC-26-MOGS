
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Protocol {
    id: string;
    name: string;
    description: string;
    grind: string;
    ratio: string;
    temp: string;
    time: string;
    icon: string; // ASCII visual representation or simple path
}

const protocols: Protocol[] = [
    {
        id: 'espresso',
        name: 'Espresso',
        description: 'High pressure extraction. The purest form of fuel.',
        grind: 'Fine (Salt)',
        ratio: '1:2',
        temp: '93°C',
        time: '25-30s',
        icon: '⚡'
    },
    {
        id: 'mokapot',
        name: 'Moka Pot',
        description: 'Stovetop pressure. Dense, heavy body.',
        grind: 'Medium-Fine',
        ratio: '1:7',
        temp: 'Boil',
        time: '3-4m',
        icon: '🔥'
    },
    {
        id: 'frenchpress',
        name: 'French Press',
        description: 'Full immersion. Maximum oil retention.',
        grind: 'Coarse',
        ratio: '1:15',
        temp: '95°C',
        time: '4m',
        icon: '💧'
    },
    {
        id: 'aeropress',
        name: 'Aeropress',
        description: 'Hybrid immersion/pressure. Versatile intensity.',
        grind: 'Medium',
        ratio: '1:13',
        temp: '85°C',
        time: '2m',
        icon: '💨'
    }
];

const ProtocolCard: React.FC<{ protocol: Protocol }> = ({ protocol }) => {
    return (
        <motion.div
            key={protocol.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex flex-col justify-center"
        >
            <div className="border border-black/10 bg-white p-8 md:p-12 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                {/* Background Tech Elements */}
                <div className="absolute top-0 right-0 p-4 opacity-10 font-mono text-6xl pointer-events-none">
                    {protocol.icon}
                </div>

                <h3 className="text-4xl md:text-5xl font-black font-serif italic mb-6">
                    {protocol.name}
                </h3>
                <p className="text-zinc-600 font-sans text-lg mb-10 max-w-sm">
                    {protocol.description}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-8 font-mono text-sm">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-400">Grind Size</span>
                        <div className="flex items-center gap-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                className="h-0.5 bg-[#CE2029]"
                            />
                            <span className="font-bold whitespace-nowrap">{protocol.grind}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-400">Ratio</span>
                        <span className="font-bold border-b border-dashed border-black/20 pb-1">{protocol.ratio}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-400">Temperature</span>
                        <span className="font-bold">{protocol.temp}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-400">Time</span>
                        <span className="font-bold">{protocol.time}</span>
                    </div>
                </div>

                {/* "Execute" Button Mock */}
                <div className="mt-12 pt-6 border-t border-black/10 flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Status: Ready</span>
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-2 h-2 rounded-full bg-[#CE2029] animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const BrewProtocols: React.FC = () => {
    const [selectedId, setSelectedId] = useState(protocols[0].id);
    const activeProtocol = protocols.find(p => p.id === selectedId) || protocols[0];

    return (
        <section className="bg-[#F9F8F4] py-32 border-b border-black/10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">

                {/* Section Header */}
                <div className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div>
                        <span className="text-xs font-sans uppercase tracking-[0.4em] text-[#CE2029] block mb-4">
                            Operational Manual
                        </span>
                        <h2 className="text-5xl md:text-7xl font-serif font-black leading-none text-[#1A1A1A]">
                            Extraction<br />Protocols.
                        </h2>
                    </div>
                    <p className="max-w-xs text-zinc-500 font-sans leading-relaxed text-sm md:text-right">
                        Optimized parameters for maximum caffeine yield and flavor density. Do not deviate.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* LEFT: Selector List */}
                    <div className="lg:w-1/3 flex flex-col gap-2">
                        {protocols.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedId(p.id)}
                                className={`group flex items-center justify-between p-6 text-left transition-all duration-300 border border-transparent ${selectedId === p.id ? 'bg-black text-white' : 'hover:bg-black/5 border-black/5'}`}
                            >
                                <span className={`text-lg font-bold font-serif italic tracking-wide ${selectedId === p.id ? 'text-white' : 'text-zinc-800'}`}>
                                    {p.name}
                                </span>
                                {selectedId === p.id && (
                                    <motion.span
                                        layoutId="active-arrow"
                                        className="text-[#CE2029]"
                                    >
                                        →
                                    </motion.span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* RIGHT: Active Protocol Card */}
                    <div className="lg:w-2/3 min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <ProtocolCard protocol={activeProtocol} />
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default BrewProtocols;
