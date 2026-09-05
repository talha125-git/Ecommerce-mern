import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  ArrowUpRight,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';

const STATUS_CONFIG = {
  Delivered: { color: '#10B981', light: '#ECFDF5', textClass: 'text-emerald-700' },
  Shipped: { color: '#3B82F6', light: '#EFF6FF', textClass: 'text-blue-700' },
  Processing: { color: '#F59E0B', light: '#FFFBEB', textClass: 'text-amber-700' },
  Pending: { color: '#8B5CF6', light: '#F5F3FF', textClass: 'text-purple-700' },
  Cancelled: { color: '#EF4444', light: '#FEF2F2', textClass: 'text-rose-700' }
};

const DashboardCharts = ({ orders = [], products = [], customers = [] }) => {
  const [timeframe, setTimeframe] = useState('7days'); // '7days' | '30days' | 'monthly'
  const [metricView, setMetricView] = useState('revenue'); // 'revenue' | 'orders'
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);
  const [hoveredPieIndex, setHoveredPieIndex] = useState(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  const containerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(600);

  // Resize listener for responsive SVG
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setChartWidth(containerRef.current.clientWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Process Time Series Data (Revenue & Orders over time)
  const timeSeriesData = useMemo(() => {
    const now = new Date();
    let daysCount = 7;
    if (timeframe === '30days') daysCount = 30;

    if (timeframe === 'monthly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthMap = {};
      
      months.forEach((m, idx) => {
        monthMap[idx] = { label: m, revenue: 0, ordersCount: 0 };
      });

      orders.forEach(order => {
        if (order.status === 'Cancelled') return;
        const d = new Date(order.createdAt || Date.now());
        if (!isNaN(d.getTime())) {
          const mIdx = d.getMonth();
          monthMap[mIdx].revenue += Number(order.totalAmount || 0);
          monthMap[mIdx].ordersCount += 1;
        }
      });

      return months.map((m, idx) => monthMap[idx]);
    }

    // Daily Timeline for Last 7 or 30 days
    const dailyMap = {};
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap[key] = { key, label, revenue: 0, ordersCount: 0 };
    }

    orders.forEach(order => {
      if (order.status === 'Cancelled') return;
      const orderDate = new Date(order.createdAt || Date.now());
      if (!isNaN(orderDate.getTime())) {
        const key = orderDate.toISOString().split('T')[0];
        if (dailyMap[key]) {
          dailyMap[key].revenue += Number(order.totalAmount || 0);
          dailyMap[key].ordersCount += 1;
        }
      }
    });

    return Object.values(dailyMap);
  }, [orders, timeframe]);

  // Total summary for selected period
  const periodStats = useMemo(() => {
    const totalRev = timeSeriesData.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalOrd = timeSeriesData.reduce((acc, curr) => acc + curr.ordersCount, 0);
    const avgOrderVal = totalOrd > 0 ? totalRev / totalOrd : 0;
    const maxRevDay = [...timeSeriesData].sort((a, b) => b.revenue - a.revenue)[0];

    return { totalRev, totalOrd, avgOrderVal, maxRevDay };
  }, [timeSeriesData]);

  // SVG Area Chart Calculations
  const chartHeight = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 55 };
  const graphWidth = Math.max(200, chartWidth - padding.left - padding.right);
  const graphHeight = chartHeight - padding.top - padding.bottom;

  const maxValue = useMemo(() => {
    const vals = timeSeriesData.map(d => (metricView === 'revenue' ? d.revenue : d.ordersCount));
    const max = Math.max(...vals, 1);
    return Math.ceil(max * 1.15); // Add 15% headroom
  }, [timeSeriesData, metricView]);

  const points = useMemo(() => {
    if (!timeSeriesData.length) return [];
    const step = graphWidth / Math.max(1, timeSeriesData.length - 1);
    return timeSeriesData.map((d, i) => {
      const val = metricView === 'revenue' ? d.revenue : d.ordersCount;
      const x = padding.left + i * step;
      const y = padding.top + graphHeight - (val / maxValue) * graphHeight;
      return { x, y, data: d, val };
    });
  }, [timeSeriesData, metricView, maxValue, graphWidth, graphHeight]);

  // Generate smooth SVG Path (Cubic Bezier curve)
  const pathD = useMemo(() => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX = (curr.x + next.x) / 2;
      d += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
    }
    return d;
  }, [points]);

  const areaD = useMemo(() => {
    if (!pathD || points.length === 0) return '';
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const bottomY = padding.top + graphHeight;
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathD, points, graphHeight]);

  // Y-Axis Ticks
  const yTicks = useMemo(() => {
    const ticksCount = 4;
    const step = maxValue / ticksCount;
    return Array.from({ length: ticksCount + 1 }, (_, i) => {
      const val = Math.round(i * step);
      const y = padding.top + graphHeight - (val / maxValue) * graphHeight;
      return { val, y };
    });
  }, [maxValue, graphHeight]);

  // 2. Process Order Status Breakdown (Donut Chart)
  const statusData = useMemo(() => {
    const counts = {
      Delivered: 0,
      Shipped: 0,
      Processing: 0,
      Pending: 0,
      Cancelled: 0
    };

    orders.forEach(o => {
      const st = o.status || 'Pending';
      if (counts[st] !== undefined) {
        counts[st] += 1;
      } else {
        counts.Pending += 1;
      }
    });

    const total = orders.length || 1;
    return Object.keys(counts).map(st => ({
      name: st,
      value: counts[st],
      percentage: Math.round((counts[st] / total) * 100),
      color: STATUS_CONFIG[st]?.color || '#6B7280'
    }));
  }, [orders]);

  // Donut SVG Arc Calculations
  const donutArcs = useMemo(() => {
    const total = orders.length || 1;
    let accumulatedAngle = 0;
    const radius = 65;
    const cx = 90;
    const cy = 90;
    const strokeWidth = 24;

    return statusData.map((item, idx) => {
      const sliceAngle = (item.value / total) * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + sliceAngle;
      accumulatedAngle += sliceAngle;

      if (item.value === 0) return { ...item, path: '', idx };

      // Convert angles to SVG arc coordinates
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);

      const largeArcFlag = sliceAngle > 180 ? 1 : 0;

      const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
      return { ...item, path, idx };
    });
  }, [statusData, orders]);

  // 3. Process Category Breakdown (Bar Chart)
  const categoryData = useMemo(() => {
    const map = {};
    products.forEach(p => {
      const cat = p.category || 'General';
      if (!map[cat]) {
        map[cat] = { category: cat, count: 0, totalValue: 0 };
      }
      map[cat].count += 1;
      map[cat].totalValue += (Number(p.price) || 0) * (Number(p.stock) || 10);
    });

    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [products]);

  const maxCategoryCount = useMemo(() => {
    const max = Math.max(...categoryData.map(c => c.count), 1);
    return Math.ceil(max * 1.2);
  }, [categoryData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Main Interactive Revenue & Analytics Area Chart */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Sales & Revenue Analytics
              </h2>
            </div>
            <p className="text-xs text-gray-500 pl-9">
              Real-time graphs compiled from MongoDB store transaction history.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle: Revenue vs Orders */}
            <div className="bg-gray-100 p-1 rounded-2xl flex items-center gap-1 text-xs font-semibold text-gray-600">
              <button
                onClick={() => setMetricView('revenue')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  metricView === 'revenue'
                    ? 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'hover:text-gray-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                Revenue
              </button>
              <button
                onClick={() => setMetricView('orders')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  metricView === 'orders'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'hover:text-gray-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Orders
              </button>
            </div>

            {/* Timeframe Selector */}
            <div className="bg-gray-100 p-1 rounded-2xl flex items-center gap-1 text-xs font-semibold text-gray-600">
              <button
                onClick={() => setTimeframe('7days')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  timeframe === '7days'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'hover:text-gray-900'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeframe('30days')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  timeframe === '30days'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'hover:text-gray-900'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeframe('monthly')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  timeframe === 'monthly'
                    ? 'bg-slate-900 text-white font-bold'
                    : 'hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        {/* Selected Period KPI Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Selected Period Revenue
            </span>
            <div className="text-lg font-black text-gray-900">
              ${periodStats.totalRev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Period Orders
            </span>
            <div className="text-lg font-black text-gray-900">
              {periodStats.totalOrd} orders
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Avg Order Value (AOV)
            </span>
            <div className="text-lg font-black text-emerald-600">
              ${periodStats.avgOrderVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Peak Day
            </span>
            <div className="text-lg font-black text-blue-600 truncate">
              {periodStats.maxRevDay ? periodStats.maxRevDay.label : 'N/A'}
            </div>
          </div>
        </div>

        {/* Dynamic Pure Native SVG Area Chart Component */}
        <div ref={containerRef} className="w-full relative pt-2">
          <svg width={chartWidth} height={chartHeight} className="overflow-visible">
            <defs>
              <linearGradient id="areaGradientEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="areaGradientBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={tick.y}
                  x2={padding.left + graphWidth}
                  y2={tick.y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={tick.y + 4}
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {metricView === 'revenue'
                    ? `$${tick.val >= 1000 ? (tick.val / 1000).toFixed(1) + 'k' : tick.val}`
                    : tick.val}
                </text>
              </g>
            ))}

            {/* Area Fill */}
            {areaD && (
              <path
                d={areaD}
                fill={metricView === 'revenue' ? 'url(#areaGradientEmerald)' : 'url(#areaGradientBlue)'}
              />
            )}

            {/* Main Smooth Bezier Line Path */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke={metricView === 'revenue' ? '#10B981' : '#3B82F6'}
                strokeWidth="3"
                strokeLinecap="round"
              />
            )}

            {/* Interactive Circles & X-Axis Labels */}
            {points.map((p, idx) => {
              const isHovered = hoveredPointIndex === idx;
              return (
                <g key={idx}>
                  {/* X-Axis Tick Labels */}
                  {(timeframe === '7days' || idx % Math.ceil(points.length / 7) === 0) && (
                    <text
                      x={p.x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {p.data.label}
                    </text>
                  )}

                  {/* Vertical Guide line on Hover */}
                  {isHovered && (
                    <line
                      x1={p.x}
                      y1={padding.top}
                      x2={p.x}
                      y2={padding.top + graphHeight}
                      stroke={metricView === 'revenue' ? '#10B981' : '#3B82F6'}
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 7 : 4}
                    fill={metricView === 'revenue' ? '#10B981' : '#3B82F6'}
                    stroke="#FFFFFF"
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all duration-150 cursor-pointer"
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Hover Tooltip */}
          {hoveredPointIndex !== null && points[hoveredPointIndex] && (
            <div
              className="absolute z-20 bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1 pointer-events-none transition-all duration-150"
              style={{
                left: Math.min(Math.max(points[hoveredPointIndex].x - 80, 10), chartWidth - 180),
                top: Math.max(points[hoveredPointIndex].y - 80, 10)
              }}
            >
              <div className="font-bold text-slate-300 border-b border-slate-800 pb-1 flex justify-between gap-3">
                <span>{points[hoveredPointIndex].data.label}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                  {points[hoveredPointIndex].data.ordersCount} orders
                </span>
              </div>
              <div className="pt-1 flex justify-between gap-4">
                <span className="text-slate-400">Total Revenue:</span>
                <span className="font-extrabold text-emerald-400 font-mono">
                  ${points[hoveredPointIndex].data.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Total Orders:</span>
                <span className="font-extrabold text-blue-400 font-mono">
                  {points[hoveredPointIndex].data.ordersCount}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid for Donut Chart (Status) & Bar Chart (Categories) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown Donut Chart */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <PieIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Order Status Distribution
                </h3>
                <p className="text-[11px] text-gray-500">Live breakdown by order status</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg">
              {orders.length} Orders
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
            {/* SVG Donut */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg width="180" height="180" viewBox="0 0 180 180" className="overflow-visible">
                {donutArcs.map((arc) => {
                  if (!arc.path) return null;
                  const isHovered = hoveredPieIndex === arc.idx;
                  return (
                    <path
                      key={arc.name}
                      d={arc.path}
                      fill="none"
                      stroke={arc.color}
                      strokeWidth={isHovered ? 28 : 22}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredPieIndex(arc.idx)}
                      onMouseLeave={() => setHoveredPieIndex(null)}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-black text-gray-900">{orders.length}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
              </div>
            </div>

            {/* Custom Legend List */}
            <div className="w-full space-y-2">
              {statusData.map((st, idx) => (
                <div
                  key={st.name}
                  onMouseEnter={() => setHoveredPieIndex(idx)}
                  onMouseLeave={() => setHoveredPieIndex(null)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition cursor-pointer ${
                    hoveredPieIndex === idx ? 'bg-gray-100 font-bold' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                    <span className="text-gray-700 font-medium">{st.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-gray-900">{st.value}</span>
                    <span className="text-[10px] text-gray-400">({st.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Inventory Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Category Distribution
                </h3>
                <p className="text-[11px] text-gray-500">Products in stock per category</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
              {products.length} Products
            </span>
          </div>

          <div className="space-y-3 py-1">
            {categoryData.length === 0 ? (
              <div className="text-center text-gray-400 text-xs py-8">
                No catalog items found.
              </div>
            ) : (
              categoryData.map((cat, idx) => {
                const percent = Math.round((cat.count / maxCategoryCount) * 100);
                const isHovered = hoveredBarIndex === idx;
                return (
                  <div
                    key={cat.category}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="space-y-1 cursor-pointer"
                  >
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-800 font-semibold">{cat.category}</span>
                      <span className="text-gray-500 font-mono">
                        {cat.count} items <span className="text-emerald-600 font-bold">(${cat.totalValue.toLocaleString()})</span>
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHovered ? 'bg-indigo-600' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="text-[11px] text-gray-400 flex items-center justify-between pt-2 border-t border-gray-100">
            <span>Hover on category bars to highlight stock valuation</span>
            <span className="font-semibold text-indigo-600 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Dynamic Catalog
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
