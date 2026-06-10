import { useState, useEffect, useMemo } from "react";
import PageHeader from "../components/shared/PageHeader";
import { FileText, BarChart2 } from "lucide-react";
import TabGroup from "./productos/components/tabs/TabGroup";
import Tab from "./productos/components/tabs/Tab";
import { useOrders } from "../hooks/useOrders";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function VentasPage() {
    const [activeTab, setActiveTab] = useState("estadisticas");
    const [timeFilter, setTimeFilter] = useState("mes");
    const { orders, fetchOrders, loading } = useOrders();

    useEffect(() => {
        fetchOrders();
    }, []);

    const data = useMemo(() => {
        if (!orders) return { topProducts: [], histogram: [], kpis: { total: 0, count: 0, ticket: 0 } };

        const now = new Date();
        const filteredOrders = orders.filter(o => {
            if (o.estado === "cancelado" || o.estado === "cancelada") return false;

            const orderDate = new Date(o.fecha);
            if (timeFilter === "hoy") {
                return orderDate.toDateString() === now.toDateString();
            }
            if (timeFilter === "semana") {
                const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
                return orderDate >= firstDay;
            }
            if (timeFilter === "mes") {
                return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
            }
            return true;
        });

        const totalIngresos = filteredOrders.reduce((sum, o) => sum + o.total, 0);
        const totalOrdenes = filteredOrders.length;
        const ticketPromedio = totalOrdenes > 0 ? totalIngresos / totalOrdenes : 0;

        const productCounts = {};
        filteredOrders.forEach(order => {
            if (!order.detalles) return;
            order.detalles.forEach(d => {
                const name = d.producto?.nombre || "Producto Desconocido";
                productCounts[name] = (productCounts[name] || 0) + d.cantidad;
            });
        });
        
        const topProducts = Object.entries(productCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 4);

        const histogramMap = {};
        filteredOrders.forEach(order => {
            const dateStr = new Date(order.fecha).toLocaleDateString("es-ES", { day: '2-digit', month: 'short' });
            const key = timeFilter === "hoy" 
                ? new Date(order.fecha).toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' }) 
                : dateStr;
            histogramMap[key] = (histogramMap[key] || 0) + order.total;
        });

        const histogram = Object.entries(histogramMap)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => a.name.localeCompare(b.name));

        return { topProducts, histogram, kpis: { total: totalIngresos, count: totalOrdenes, ticket: ticketPromedio } };
    }, [orders, timeFilter]);

    const COLORS = ['#EE791C', '#FFA559', '#FFD099', '#FFE6C7', '#FFF3E3'];

    const formatCurrency = (value) => `$${value.toFixed(2)}`;

    return (
        <div className="pt-6 px-6 md:px-10 lg:px-11 pb-0 h-full flex flex-col">
            <PageHeader title={"Ventas"}>
                <div className="hidden md:flex">
                    <TabGroup selectedKey={activeTab} onSelectionChange={setActiveTab}>
                        <Tab id="reportes" title="Reportes" icon={<FileText size={16} />} />
                        <Tab id="estadisticas" title="Estadísticas" icon={<BarChart2 size={16} />} />
                    </TabGroup>
                </div>
            </PageHeader>

            <div className="md:hidden mt-4 overflow-x-auto pb-2 flex-shrink-0">
                <TabGroup selectedKey={activeTab} onSelectionChange={setActiveTab}>
                    <Tab id="reportes" title="Reportes" icon={<FileText size={16} />} />
                    <Tab id="estadisticas" title="Estadísticas" icon={<BarChart2 size={16} />} />
                </TabGroup>
            </div>

            <div className="mt-6 flex-1 min-h-0 flex flex-col overflow-y-auto pb-28">
                {activeTab === "estadisticas" && (
                    <div className="flex flex-col gap-6 h-full">
                        {/* Filtros de Tiempo y KPIs */}
                        <div className="flex flex-col xl:flex-row gap-6">
                            {/* Filtros */}
                            <div className="bg-white rounded-2xl border border-[var(--color-borderInput)] p-2 flex gap-2 w-full xl:w-auto overflow-x-auto">
                                {["hoy", "semana", "mes", "siempre"].map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setTimeFilter(filter)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize whitespace-nowrap transition-colors ${
                                            timeFilter === filter 
                                            ? "bg-[var(--color-primaryAction)] text-white" 
                                            : "text-gray-500 hover:bg-gray-100"
                                        }`}
                                    >
                                        {filter === "siempre" ? "Todo el tiempo" : `Este ${filter === "hoy" ? "día" : filter}`}
                                    </button>
                                ))}
                            </div>

                            {/* KPIs */}
                            <div className="flex gap-4 flex-1 overflow-x-auto">
                                <div className="bg-white border border-[var(--color-borderInput)] rounded-2xl p-4 flex-1 min-w-[140px]">
                                    <p className="text-sm text-gray-500 font-medium mb-1">Ingresos Totales</p>
                                    <h4 className="text-2xl font-bold text-[var(--color-primaryText)]">{formatCurrency(data.kpis.total)}</h4>
                                </div>
                                <div className="bg-white border border-[var(--color-borderInput)] rounded-2xl p-4 flex-1 min-w-[140px]">
                                    <p className="text-sm text-gray-500 font-medium mb-1">Órdenes Realizadas</p>
                                    <h4 className="text-2xl font-bold text-[var(--color-primaryText)]">{data.kpis.count}</h4>
                                </div>
                                <div className="bg-white border border-[var(--color-borderInput)] rounded-2xl p-4 flex-1 min-w-[140px]">
                                    <p className="text-sm text-gray-500 font-medium mb-1">Ticket Promedio</p>
                                    <h4 className="text-2xl font-bold text-[var(--color-primaryText)]">{formatCurrency(data.kpis.ticket)}</h4>
                                </div>
                            </div>
                        </div>

                        {/* Cards de Gráficas */}
                        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[300px]">
                            {/* Producto más vendido */}
                            <div className="bg-white rounded-[20px] border border-[var(--color-borderInput)] p-5 lg:p-6 flex-1 flex flex-col shadow-sm">
                                <h3 className="text-lg lg:text-xl font-bold text-[var(--color-primaryText)] mb-4">Productos más vendidos</h3>
                                
                                <div className="flex-1 flex items-center justify-center min-h-[180px]">
                                    {loading ? (
                                        <p className="text-gray-400">Cargando datos...</p>
                                    ) : data.topProducts.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={data.topProducts}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={45}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {data.topProducts.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    formatter={(value) => [`${value} unidades`, "Ventas"]}
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p className="text-gray-400">No hay ventas registradas.</p>
                                    )}
                                </div>
                                
                                {/* Leyenda personalizada */}
                                {data.topProducts.length > 0 && (
                                    <div className="mt-4 flex flex-wrap justify-center gap-4">
                                        {data.topProducts.map((entry, index) => (
                                            <div key={entry.name} className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                                <span className="text-sm text-gray-600">{entry.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Historigrama */}
                            <div className="bg-white rounded-[20px] border border-[var(--color-borderInput)] p-5 lg:p-6 flex-[1.5] flex flex-col shadow-sm">
                                <h3 className="text-lg lg:text-xl font-bold text-[var(--color-primaryText)] mb-4">Ingresos a lo largo del tiempo</h3>
                                <div className="flex-1 min-h-[180px]">
                                    {loading ? (
                                        <div className="h-full flex items-center justify-center">
                                            <p className="text-gray-400">Cargando datos...</p>
                                        </div>
                                    ) : data.histogram.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={data.histogram} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis 
                                                    dataKey="name" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                                                    dy={10}
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                                                    tickFormatter={(value) => `$${value}`}
                                                />
                                                <Tooltip 
                                                    cursor={{ fill: '#f9fafb' }}
                                                    formatter={(value) => [formatCurrency(value), "Ingresos"]}
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                />
                                                <Bar dataKey="total" fill="var(--color-primaryAction)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center">
                                            <p className="text-gray-400">No hay ventas para el periodo seleccionado.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "reportes" && (
                    <div className="bg-transparent h-full flex flex-col">
                        <h3 className="text-xl font-semibold text-[var(--color-primaryText)] mb-4">Reportes</h3>
                        <p className="text-[var(--color-secundaryText)]">Generación y descarga de reportes próximamente...</p>
                    </div>
                )}
            </div>
        </div>
    );
}