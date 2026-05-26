import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, Package, Users } from 'lucide-react';
import { API_URL } from '../config';

function DashboardHome() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const isDueño = usuario.rol === 'Dueño';
    const [ventasHoy, setVentasHoy] = useState({ total_ventas: 0, total_ingresos: 0 });
    const [totalPlantas, setTotalPlantas] = useState(0);
    const [totalVendedores, setTotalVendedores] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isDueño) {
            cargarDatosDashboard();
        } else {
            setLoading(false);
        }
    }, []);

    const cargarDatosDashboard = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const ventasRes = await axios.get(`${API_URL}/ventas/resumen-hoy`, config);
            const plantasRes = await axios.get(`${API_URL}/plantas`);
            const usuariosRes = await axios.get(`${API_URL}/usuarios`, config);
            
            setVentasHoy({
                total_ventas: Number(ventasRes.data.total_ventas) || 0,
                total_ingresos: Number(ventasRes.data.total_ingresos) || 0
            });
            setTotalPlantas(plantasRes.data.length || 0);
            setTotalVendedores(usuariosRes.data.filter(u => u.rol === 'Vendedor').length || 0);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const statsCards = [
        { title: "Ventas hoy", value: ventasHoy.total_ventas, icon: TrendingUp, color: "#93A267" },
        { title: "Ingresos hoy", value: `$${Number(ventasHoy.total_ingresos).toFixed(2)}`, icon: DollarSign, color: "#485935" },
        { title: "Productos", value: totalPlantas, icon: Package, color: "#CADBB7", textColor: "#1B4332" },
        { title: "Vendedores", value: totalVendedores, icon: Users, color: "#E8EFE0", textColor: "#1B4332" }
    ];

    if (!isDueño) {
        return (
            <div className="text-center py-10">
                <p style={{ color: '#93A267' }}>Bienvenido, {usuario.nombre}</p>
            </div>
        );
    }

    return (
        <div>
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-pulse text-4xl mb-4">🌿</div>
                    <p style={{ color: '#93A267' }}>Cargando estadísticas...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={index}
                                className="rounded-2xl p-6 shadow-sm transition hover:shadow-md"
                                style={{ backgroundColor: card.color }}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm opacity-70" style={{ color: card.textColor || 'white' }}>
                                            {card.title}
                                        </p>
                                        <p className="text-2xl font-bold mt-2" style={{ color: card.textColor || 'white' }}>
                                            {card.value}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                                        <Icon size={20} style={{ color: card.textColor || 'white' }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default DashboardHome;