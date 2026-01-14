import React, { useState, useMemo } from 'react';
import { useDataContext } from '../DataContext';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts';
import { Calendar, TrendingUp, DollarSign, CalendarDays } from 'lucide-react';

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

const SalesInsights: React.FC = () => {
    const { orders } = useDataContext();
    const [timeRange, setTimeRange] = useState<TimeRange>('daily');

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Helper to get start date based on range
    const getStartDate = (range: TimeRange) => {
        const now = new Date();
        switch (range) {
            case 'daily':
                // Last 30 days
                return new Date(now.setDate(now.getDate() - 30));
            case 'weekly':
                // Last 12 weeks
                return new Date(now.setDate(now.getDate() - 7 * 12));
            case 'monthly':
                // Last 12 months
                return new Date(now.setMonth(now.getMonth() - 12));
            case 'yearly':
                // Last 5 years
                return new Date(now.setFullYear(now.getFullYear() - 5));
            default:
                return new Date(0);
        }
    };

    // Aggregation Logic
    const chartData = useMemo(() => {
        if (!orders || orders.length === 0) return [];

        const startDate = getStartDate(timeRange);
        const validOrders = orders.filter(
            (o) => {
                const date = new Date(o.date);
                // Check date validity
                if (isNaN(date.getTime())) return false;

                // Include:
                // 1. Explicitly PAID status
                // 2. Pay at Counter (even if Pending)
                // 3. PENDING_PAYMENT (often used for Counter/Cash orders in this system)
                const isPaid = o.payment_status === 'PAID' || o.payment_status === 'Paid';
                const isCounter = o.payment_method === 'Paid at Counter' || o.payment_method === 'counter';
                const isPending = o.payment_status === 'PENDING_PAYMENT'; // Capture initial counter orders

                return date >= startDate && (isPaid || isCounter || isPending);
            }
        );
        // Sort by date ascending for aggregation
        validOrders.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


        const dataMap = new Map<string, number>();

        validOrders.forEach((order) => {
            const date = new Date(order.date);
            let key = '';

            switch (timeRange) {
                case 'daily':
                    // DD MMM, e.g., 24 Oct
                    key = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                    break;
                case 'weekly':
                    // Week start derived or simple "Wk 42"
                    // For simplicity in this demo, grouping by distinct week string or just every 7 days?
                    // Let's use logic: Start of week key
                    const startOfWeek = new Date(date);
                    startOfWeek.setDate(date.getDate() - date.getDay()); // Sunday start
                    key = startOfWeek.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                    break;
                case 'monthly':
                    // MMM YYYY
                    key = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
                    break;
                case 'yearly':
                    key = date.getFullYear().toString();
                    break;
            }

            dataMap.set(key, (dataMap.get(key) || 0) + order.total);
        });

        // Convert map to array and handle gaps if necessary (skipping gap filling for simplicity now)
        return Array.from(dataMap.entries()).map(([name, value]) => ({ name, value }));
    }, [orders, timeRange]);

    // Stats Logic
    const stats = useMemo(() => {
        const totalSales = chartData.reduce((acc, curr) => acc + curr.value, 0);
        const averageSales = chartData.length > 0 ? totalSales / chartData.length : 0;
        const peakSales = Math.max(...chartData.map((d) => d.value), 0);

        // Find the record with peak sales
        const peakRecord = chartData.find(d => d.value === peakSales);

        return { totalSales, averageSales, peakSales, peakLabel: peakRecord?.name };
    }, [chartData]);


    return (
        <div className="space-y-8 font-sans animate-in fade-in duration-500">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-serif italic tracking-tight text-[#0a0a0a]">
                        Sales Performance Overview
                    </h2>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 mt-1">
                        Track revenue patterns across time periods
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Custom Select mimicking the minimalist style */}
                    <div className="relative group">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                            className="appearance-none bg-white border border-black/10 rounded-md px-4 py-2 pr-8 text-xs uppercase tracking-[0.2em] focus:outline-none focus:border-black/30 cursor-pointer hover:bg-black/5 transition-colors"
                        >
                            <option value="daily">Daily View</option>
                            <option value="weekly">Weekly View</option>
                            <option value="monthly">Monthly View</option>
                            <option value="yearly">Yearly View</option>
                        </select>
                        <CalendarDays className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="bg-white rounded-xl border border-black/5 p-6 shadow-sm">
                <div className="h-[350px] w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000000" strokeOpacity={0.05} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#0a0a0a"
                                    strokeOpacity={0.3}
                                    tick={{ fontSize: 10, fontFamily: 'sans-serif', fill: '#71717a' }}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tickFormatter={(value) => `₹${value}`}
                                    stroke="#0a0a0a"
                                    strokeOpacity={0.3}
                                    tick={{ fontSize: 10, fontFamily: 'sans-serif', fill: '#71717a' }}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0a0a0a',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#F9F8F4',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                    itemStyle={{ color: '#F9F8F4', fontSize: '11px', fontFamily: 'sans-serif' }}
                                    labelStyle={{ color: '#a1a1aa', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}
                                    formatter={(value: number) => [`₹${value}`, 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#0a0a0a"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    activeDot={{ r: 4, stroke: '#F9F8F4', strokeWidth: 2, fill: '#0a0a0a' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                            <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-xs uppercase tracking-[0.2em]">No sales data for this period</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#FAF9F6] border border-black/5 rounded-xl p-5 flex flex-col justify-between h-28 hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-sans">Total Sales</span>
                        <DollarSign className="w-4 h-4 text-black/40" />
                    </div>
                    <div>
                        <p className="text-2xl font-serif text-[#0a0a0a]">{formatCurrency(stats.totalSales)}</p>
                        <p className="text-[10px] text-emerald-600 mt-1 font-sans">For selected period</p>
                    </div>
                </div>

                <div className="bg-[#FAF9F6] border border-black/5 rounded-xl p-5 flex flex-col justify-between h-28 hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-sans">Average</span>
                        <TrendingUp className="w-4 h-4 text-black/40" />
                    </div>
                    <div>
                        <p className="text-2xl font-serif text-[#0a0a0a]">{formatCurrency(stats.averageSales)}</p>
                        <p className="text-[10px] text-zinc-400 mt-1 font-sans">Per {timeRange === 'daily' ? 'day' : timeRange === 'weekly' ? 'week' : 'month'}</p>
                    </div>
                </div>

                <div className="bg-[#FAF9F6] border border-black/5 rounded-xl p-5 flex flex-col justify-between h-28 hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-sans">Highest Peak</span>
                        <Calendar className="w-4 h-4 text-black/40" />
                    </div>
                    <div>
                        <p className="text-2xl font-serif text-[#0a0a0a]">{formatCurrency(stats.peakSales)}</p>
                        <p className="text-[10px] text-zinc-400 mt-1 font-sans capitalize">{stats.peakLabel || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesInsights;
