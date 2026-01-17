import React, { useState, useMemo } from 'react';
import { useDataContext } from '../DataContext';
import { Filter, CalendarDays, TrendingUp, Info, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

type TimeRange = 'today' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'past_12_months' | 'all_time';

const ItemAffinity: React.FC = () => {
    const { orders } = useDataContext();
    const [timeRange, setTimeRange] = useState<TimeRange>('past_12_months');
    const [sortField, setSortField] = useState<'frequency' | 'strength'>('frequency');
    const [isRecommendationOpen, setIsRecommendationOpen] = useState(false);

    // Robust Date Parser
    const parseOrderDate = (dateStr: string) => {
        if (!dateStr) return new Date(0);
        let date = new Date(dateStr);
        if (!isNaN(date.getTime())) return date;
        try {
            const datePart = dateStr.split(',')[0].trim();
            const parts = datePart.split('/');
            if (parts.length === 3) {
                // assume dd/mm/yyyy
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                const parsed = new Date(year, month, day);
                if (!isNaN(parsed.getTime())) return parsed;
            }
        } catch (e) { }
        return new Date(0);
    };

    // Helper to filter orders based on range
    const filterOrdersByTime = (orders: any[], range: TimeRange) => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return orders.filter(o => {
            const date = parseOrderDate(o.date);
            if (date.getTime() === 0) return false;

            switch (range) {
                case 'today':
                    return date >= startOfDay;
                case 'this_week': {
                    const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                    firstDayOfWeek.setHours(0, 0, 0, 0);
                    return date >= firstDayOfWeek;
                }
                case 'last_week': {
                    const startOfLastWeek = new Date(now.setDate(now.getDate() - now.getDay() - 7));
                    startOfLastWeek.setHours(0, 0, 0, 0);
                    const endOfLastWeek = new Date(startOfLastWeek);
                    endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
                    endOfLastWeek.setHours(23, 59, 59, 999);
                    return date >= startOfLastWeek && date <= endOfLastWeek;
                }
                case 'this_month': {
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    return date >= startOfMonth;
                }
                case 'last_month': {
                    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                    return date >= startOfLastMonth && date <= endOfLastMonth;
                }
                case 'past_12_months': {
                    const oneYearAgo = new Date();
                    oneYearAgo.setMonth(oneYearAgo.getMonth() - 13);
                    return date >= oneYearAgo;
                }
                case 'all_time': return true;
                default: return true;
            }
        });
    };

    // Aggregation Logic
    const pairData = useMemo(() => {
        if (!orders) return [];
        console.log(`[ItemAffinity] Processing ${orders.length} orders. Sample Date: ${orders[0]?.date}`);

        // 1. Filter Orders
        let validOrders = orders.filter(o => {
            const isPaid = o.payment_status === 'PAID' || o.payment_status === 'Paid';
            const isCounter = o.payment_method === 'Paid at Counter' || o.payment_method === 'counter' || (o.payment_method || '').toLowerCase().includes('counter');
            const isPending = o.payment_status === 'PENDING_PAYMENT';
            return isPaid || isCounter || isPending;
        });

        console.log(`[ItemAffinity] Orders valid by payment: ${validOrders.length}`);

        validOrders = filterOrdersByTime(validOrders, timeRange);
        console.log(`[ItemAffinity] Orders valid by time (${timeRange}): ${validOrders.length}`);

        // ... (rest of logic)

        // 2. Find Pairs
        const pairMap = new Map<string, number>();

        validOrders.forEach(order => {
            // Get unique item names in this order
            const itemNames = [...new Set(order.items.map(i => i.name))];

            if (itemNames.length > 1) {
                // Generate pairs
                for (let i = 0; i < itemNames.length; i++) {
                    for (let j = i + 1; j < itemNames.length; j++) {
                        // Sort names to ensure consistency (A-B is same as B-A)
                        const pair = [itemNames[i], itemNames[j]].sort().join('|');
                        pairMap.set(pair, (pairMap.get(pair) || 0) + 1);
                    }
                }
            }
        });

        // 3. Format Result
        const totalOrders = validOrders.length || 1; // Avoid division by zero
        return Array.from(pairMap.entries()).map(([key, count]) => {
            const [itemA, itemB] = key.split('|');
            return {
                itemA,
                itemB,
                count,
                strength: (count / totalOrders) * 100
            };
        });

    }, [orders, timeRange]);

    // Sorting
    const sortedPairs = useMemo(() => {
        return [...pairData].sort((a, b) => {
            if (sortField === 'frequency') return b.count - a.count;
            return b.strength - a.strength;
        });
    }, [pairData, sortField]);

    // Recommendation Logic
    const recommendationText = useMemo(() => {
        const top3 = sortedPairs.slice(0, 3);
        if (top3.length === 0) return "Not enough data to generate specific recommendations for this period.";

        const pair1 = top3[0];
        const pair1Str = `"${pair1.itemA} + ${pair1.itemB}"`;

        let text = `Consider introducing discounted combos or meal promotions featuring the top affinity pairs. Since ${pair1Str} is a strong attachment pair (appearing in ${pair1.strength.toFixed(1)}% of applicable orders), placing them together in the menu or as an upsell at checkout can increase conversion.`;

        if (top3.length > 1) {
            const secondaryPairs = top3.slice(1).map(p => `"${p.itemA} + ${p.itemB}"`).join(" and ");
            text += ` Secondary combos like ${secondaryPairs} can also be promoted as meal deals to boost AOV.`;
        }

        return text;
    }, [sortedPairs]);


    return (
        <div className="space-y-8 font-sans animate-in fade-in duration-500">
            {/* Header & Controls */}
            {/* Header & Controls */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-6xl font-serif italic tracking-tight text-[#0a0a0a]">
                            Item Affinity Overview
                        </h2>

                        {/* Contextual Help for Concept */}
                        <div className="relative group/tooltip z-50">
                            <button className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-black/5 transition-colors cursor-help">
                                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-bold font-sans">?</div>
                            </button>

                            <div className="absolute left-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-sm border border-black/5 rounded-xl shadow-xl p-4 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 transform translate-y-2 group-hover/tooltip:translate-y-0 text-left z-50">
                                <h4 className="font-serif text-sm font-bold text-zinc-800 mb-2">What is Item Affinity?</h4>
                                <p className="font-sans text-xs leading-relaxed text-zinc-600 mb-2">
                                    Item Affinity reveals which products are consistently bought together. Use these insights to design high-performing combos, place complementary items side-by-side on the menu, and train staff on smart upsells.
                                </p>
                                <p className="font-sans text-[10px] text-zinc-400 italic border-t border-black/5 pt-2 mt-2">
                                    Example: "Cold Brew" + "Croissant" are ordered together in 42% of cases.
                                </p>
                            </div>
                        </div>

                    </div>
                    <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-black font-bold mt-1">
                            Discover which items are frequently ordered together across different time periods
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-start gap-12">
                    <div className="flex items-center gap-2">
                        <div className="relative group">
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                                className="appearance-none bg-white border border-black/10 rounded-md px-4 py-2 pr-8 text-xs uppercase tracking-[0.2em] focus:outline-none focus:border-black/30 cursor-pointer hover:bg-black/5 transition-colors"
                            >
                                <option value="today">Today</option>
                                <option value="this_week">This Week</option>
                                <option value="last_week">Last Week</option>
                                <option value="this_month">This Month</option>
                                <option value="last_month">Last Month</option>
                                <option value="past_12_months">Past 12 Months</option>
                                <option value="all_time">All Time</option>
                            </select>
                            <CalendarDays className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        </div>

                        {/* Contextual Help for Timeline */}
                        <div className="relative group/tooltip z-50">
                            <button className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-black/5 transition-colors cursor-help">
                                <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-bold font-sans">?</div>
                            </button>

                            <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-sm border border-black/5 rounded-xl shadow-xl p-4 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 transform translate-y-2 group-hover/tooltip:translate-y-0 text-left z-50">
                                <h4 className="font-serif text-sm font-bold text-zinc-800 mb-2">Adjusting Time Range</h4>
                                <p className="font-sans text-xs leading-relaxed text-zinc-600 mb-2">
                                    Change the duration to analyze different patterns:
                                </p>
                                <ul className="list-disc list-outside pl-4 space-y-1">
                                    <li className="font-sans text-[10px] text-zinc-500"><strong>This/Last Week:</strong> Short-term trends & recent promos.</li>
                                    <li className="font-sans text-[10px] text-zinc-500"><strong>This/Last Month:</strong> Monthly performance reviews.</li>
                                    <li className="font-sans text-[10px] text-zinc-500"><strong>Past 12 Months:</strong> Long-term seasonal preferences.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    {/* Insight Summary Panel (Sticky) */}
                    <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden transition-all duration-300 flex-grow md:max-w-xl">
                        <div
                            onClick={() => setIsRecommendationOpen(!isRecommendationOpen)}
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-yellow-50 rounded-full shrink-0">
                                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-500">
                                        Insight Summary
                                    </h3>
                                    <p className="text-sm text-[#0a0a0a] font-serif italic mt-0.5">
                                        {sortedPairs.length > 0 ? `Top opportunity: Bundle "${sortedPairs[0].itemA} + ${sortedPairs[0].itemB}"` : "No insights available"}
                                    </p>
                                </div>
                            </div>
                            {isRecommendationOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                        </div>

                        {/* Expanded Content */}
                        <div className={`overflow-hidden transition-all duration-300 ${isRecommendationOpen ? 'max-h-48 opacity-100 border-t border-black/5' : 'max-h-0 opacity-0'}`}>
                            <div className="p-4 bg-zinc-50/30 text-sm text-zinc-600 leading-relaxed font-sans">
                                {recommendationText}
                            </div>
                        </div>
                    </div>
                </div>

            </div>



            {/* Content Area */}
            <div className="bg-white rounded-xl border border-black/5 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center bg-zinc-50/50">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-[#0a0a0a] font-semibold">
                        Top Item Pairs
                    </h3>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                        Ranked by Frequency
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-black/5">
                                <th className="py-4 px-6 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-400 w-16">Rank</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-400">Item A</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-400">Item B</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-400 text-right">Times Paired</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-400 text-right group cursor-help">
                                    <span className="flex items-center justify-end gap-1">
                                        Pair Strength <Info className="w-3 h-3 text-zinc-300" />
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedPairs.length > 0 ? (
                                sortedPairs.map((pair, idx) => (
                                    <tr
                                        key={`${pair.itemA}-${pair.itemB}`}
                                        className={`group transition-colors border-b border-black/5 last:border-0 hover:bg-zinc-50 ${idx < 3 ? 'bg-[#faf9f6]/30' : ''}`}
                                    >
                                        <td className="py-4 px-6 text-xs text-zinc-500 font-sans">{idx + 1}</td>
                                        <td className="py-4 px-6">
                                            <span className={`text-sm font-sans ${idx < 3 ? 'font-medium text-[#0a0a0a]' : 'text-zinc-600'}`}>
                                                {pair.itemA}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`text-sm font-sans ${idx < 3 ? 'font-medium text-[#0a0a0a]' : 'text-zinc-600'}`}>
                                                {pair.itemB}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-zinc-600 font-sans text-right">
                                            {pair.count}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end space-x-3" title={`Appeared in ${pair.strength.toFixed(1)}% of orders`}>
                                                <span className="text-sm text-zinc-600 font-sans">{pair.strength.toFixed(1)}%</span>
                                                <div className="w-16 h-1 bg-zinc-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-zinc-800 rounded-full opacity-80"
                                                        style={{ width: `${Math.min(pair.strength * 5, 100)}%` }} // Scaling for visibility
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-zinc-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
                                            <span className="text-xs uppercase tracking-[0.2em]">No significant pairs found in this period</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 bg-zinc-50/50 border-t border-black/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-zinc-400 shrink-0" />
                        <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                            Pair Strength = % of filtered orders containing this pair. (Note: These do not sum to 100%).
                        </p>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                        Showing {sortedPairs.length} Pairs
                    </p>
                </div>
            </div>


        </div>
    );
};

export default ItemAffinity;
