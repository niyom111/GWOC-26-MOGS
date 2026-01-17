import React, { useMemo, useState } from 'react';
import { useDataContext } from '../DataContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Cell
} from 'recharts';
import { Tag, TrendingUp, Filter } from 'lucide-react';

const TagPerformance: React.FC = () => {
    const { orders, menuItems } = useDataContext();
    const [sortField, setSortField] = useState<'orders' | 'impact'>('orders');

    // aggregation logic
    const tagData = useMemo(() => {
        if (!orders || !menuItems) return [];

        const tagMap = new Map<string, { count: number; revenue: number }>();
        let totalItemsSold = 0;
        let totalRevenue = 0;

        // Helper to find tags for a menu item
        const getItemTags = (itemId: string) => {
            const item = menuItems.find(i => i.id === itemId);
            if (!item) return [];

            const tags = [];
            // Add explicit tags
            if (item.tags && Array.isArray(item.tags)) {
                tags.push(...item.tags.map(t => t.name));
            }

            // Add Category as a quasi-tag for broader insight if actual tags are sparse
            if (item.category_name) tags.push(item.category_name);
            else if (item.category) tags.push(item.category);

            return [...new Set(tags)]; // Unique tags per item
        };

        orders.forEach(order => {
            // Filter for valid orders (Paid or Counter) similar to SalesInsights
            const isPaid = order.payment_status === 'PAID' || order.payment_status === 'Paid';
            const isCounter = order.payment_method === 'Paid at Counter' || order.payment_method === 'counter';
            const isPending = order.payment_status === 'PENDING_PAYMENT';

            if (isPaid || isCounter || isPending) {
                order.items.forEach(cartItem => {
                    const quantity = cartItem.quantity;
                    const price = cartItem.price || 0;
                    const itemRevenue = quantity * price;

                    totalItemsSold += quantity;
                    totalRevenue += itemRevenue;

                    const tags = getItemTags(cartItem.id);
                    tags.forEach(tagName => {
                        // Clean up tag name
                        const cleanTag = tagName.trim();
                        if (cleanTag) {
                            const current = tagMap.get(cleanTag) || { count: 0, revenue: 0 };
                            tagMap.set(cleanTag, {
                                count: current.count + quantity,
                                revenue: current.revenue + itemRevenue
                            });
                        }
                    });
                });
            }
        });

        // Convert to array
        return Array.from(tagMap.entries()).map(([name, data]) => ({
            name,
            value: data.count, // Volume
            revenue: data.revenue, // Impact
            contribution: totalItemsSold > 0 ? (data.count / totalItemsSold) * 100 : 0,
            revenueContribution: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
        }));

    }, [orders, menuItems]);

    // Sort based on selection
    const sortedData = useMemo(() => {
        return [...tagData].sort((a, b) => {
            if (sortField === 'orders') {
                return b.value - a.value;
            } else {
                return b.revenue - a.revenue;
            }
        });
    }, [tagData, sortField]);

    // Top 5 for chart
    const chartData = sortedData.slice(0, 5);
    const topTag = sortedData[0];

    return (
        <div className="space-y-8 font-sans animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-6xl font-serif italic tracking-tight text-[#0a0a0a]">
                    Tag Performance Overview
                </h2>
                <p className="text-sm uppercase tracking-[0.25em] text-black font-bold mt-1">
                    Understand how item attributes influence customer orders
                </p>
            </div>

            {/* Viz & Stats Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Horizontal Bar Chart - Top Performers */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-black/5 p-6 shadow-sm">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-[#0a0a0a] mb-6 font-semibold">
                        Top 5 Tags by {sortField === 'orders' ? 'Volume' : 'Revenue'}
                    </h3>
                    <div className="h-[300px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={chartData} margin={{ top: 0, right: 45, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#000000" strokeOpacity={0.05} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tick={{ fontSize: 12, fontFamily: 'serif', fill: '#0a0a0a', fontWeight: 500 }}
                                        width={120}
                                        tickLine={false}
                                        axisLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#000000', opacity: 0.04 }}
                                        contentStyle={{ backgroundColor: '#0a0a0a', border: 'none', borderRadius: '8px', color: '#F9F8F4', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#F9F8F4', fontSize: '12px', fontFamily: 'sans-serif' }}
                                        formatter={(value: number) => [
                                            sortField === 'orders' ? value : `₹${value.toLocaleString()}`,
                                            sortField === 'orders' ? 'Orders' : 'Revenue'
                                        ]}
                                    />
                                    <Bar dataKey={sortField === 'orders' ? 'value' : 'revenue'} radius={[0, 4, 4, 0]} barSize={32}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill="#0a0a0a" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                                <Tag className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-xs uppercase tracking-[0.2em]">No tag data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Card / Key Insight */}
                <div className="space-y-6">
                    <div className="bg-[#FAF9F6] border border-black/5 rounded-xl p-6 h-auto">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-sans">
                                Top {sortField === 'orders' ? 'Volume' : 'Revenue'} Source
                            </span>
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                        </div>
                        {topTag ? (
                            <div>
                                <p className="text-3xl font-serif text-[#0a0a0a] mb-1">{topTag.name}</p>
                                <p className="text-sm text-zinc-600">
                                    {sortField === 'orders' ? (
                                        <>Present in <span className="font-semibold text-black">{topTag.contribution.toFixed(1)}%</span> of all sold items.</>
                                    ) : (
                                        <>Generates <span className="font-semibold text-black">{topTag.revenueContribution.toFixed(1)}%</span> of total revenue.</>
                                    )}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-400">Insufficient data</p>
                        )}
                        <div className="mt-8 pt-6 border-t border-black/5">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2">Recommendation</p>
                            <p className="text-xs text-zinc-600 leading-relaxed">
                                {topTag
                                    ? `Consider creating more combos or specials featuring "${topTag.name}" items to leverage high ${sortField === 'orders' ? 'demand' : 'value'}.`
                                    : "Start tagging your menu items to generate insights."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl border border-black/5 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center bg-zinc-50/50">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-[#0a0a0a] font-semibold">
                        Tag Rankings
                    </h3>

                    {/* Simple Sort Helper */}
                    <button
                        onClick={() => setSortField(prev => prev === 'orders' ? 'impact' : 'orders')}
                        className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.15em] text-zinc-500 hover:text-black transition-colors"
                    >
                        <Filter className="w-3 h-3" />
                        <span>Sort by {sortField === 'orders' ? 'Impact (Revenue)' : 'Volume'}</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-black/5">
                                <th className="py-4 px-6 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-400 w-20">Rank</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-400">Tag Name</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-400 text-right">Orders</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-400 text-right">Revenue</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-400 text-right">
                                    {sortField === 'orders' ? 'Vol %' : 'Rev %'}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.length > 0 ? (
                                sortedData.map((tag, idx) => (
                                    <tr
                                        key={tag.name}
                                        className={`group transition-colors border-b border-black/5 last:border-0 hover:bg-zinc-50 ${idx < 3 ? 'bg-[#faf9f6]/30' : ''}`}
                                    >
                                        <td className="py-4 px-6 text-xs text-zinc-500 font-sans">
                                            {idx + 1}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`text-sm font-sans ${idx < 3 ? 'font-medium text-[#0a0a0a]' : 'text-zinc-600'}`}>
                                                {tag.name}
                                            </span>
                                            {idx === 0 && (
                                                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-100 text-emerald-800 uppercase tracking-widest">
                                                    Top
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-zinc-600 font-sans text-right">
                                            {tag.value}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-zinc-600 font-sans text-right">
                                            ₹{tag.revenue.toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end space-x-3">
                                                <span className="text-sm text-zinc-600 font-sans">
                                                    {sortField === 'orders' ? tag.contribution.toFixed(1) : tag.revenueContribution.toFixed(1)}%
                                                </span>
                                                <div className="w-16 h-1 bg-zinc-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-zinc-800 rounded-full opacity-80"
                                                        style={{ width: `${sortField === 'orders' ? tag.contribution : tag.revenueContribution}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-xs uppercase tracking-[0.2em] text-zinc-400">
                                        No data to display
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TagPerformance;
