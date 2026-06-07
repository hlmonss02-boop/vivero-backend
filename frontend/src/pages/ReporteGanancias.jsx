import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, PiggyBank, Percent, Leaf } from 'lucide-react';
import { API_URL } from '../config';

function ReporteGanancias() {
    const [datos, setDatos] = useState({ plantas: [], total_ventas: 0, total_ahorro: 0, total_comision: 0, total_ganancia: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const isDueño = usuario.rol === 'Dueño';

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Obtener ganancias reales por planta desde el backend
            const response = await axios.get(`${API_URL}/ventas/ganancias-reales-por-planta`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const { plantas, porcentaje_ahorro, porcentaje_comision } = response.data;
            
            // Solo plantas con ventas
            const conVentas = plantas.filter(p => p.cantidad_vendida > 0);
            conVentas.sort((a, b) => b.ganancia_real - a.ganancia_real);
            
            // Calcular totales
            const total_ventas = conVentas.reduce((s, p) => s + parseFloat(p.total_vendido), 0);
            const total_ahorro = conVentas.reduce((s, p) => s + parseFloat(p.ahorro_total), 0);
            const total_comision = conVentas.reduce((s, p) => s + parseFloat(p.comision_total), 0);
            const total_ganancia = conVentas.reduce((s, p) => s + parseFloat(p.ganancia_real), 0);
            
            setDatos({
                plantas: conVentas,
                total_ventas,
                total_ahorro,
                total_comision,
                total_ganancia,
                porcentaje_ahorro,
                porcentaje_comision
            });
        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isDueño) {
        return (
            <div className="text-center py-20">
                <p style={{ color: '#D97757' }}>Acceso Denegado</p>
                <p style={{ color: '#93A267' }}>Solo el dueño puede ver este reporte</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="animate-spin w-8 h-8 border-4 rounded-full mx-auto mb-3" style={{ borderColor: '#D97757', borderTopColor: 'transparent' }}></div>
                <p style={{ color: '#93A267' }}>Cargando ganancias...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <p style={{ color: '#D97757' }}>Error: {error}</p>
                <button onClick={cargarDatos} className="mt-3 px-4 py-2 rounded-lg text-white" style={{ backgroundColor: '#D97757' }}>
                    Reintentar
                </button>
            </div>
        );
    }

    if (datos.plantas.length === 0) {
        return (
            <div className="text-center py-20">
                <Leaf size={48} className="mx-auto mb-3" style={{ color: '#CADBB7' }} />
                <p style={{ color: '#93A267' }}>No hay ventas registradas</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-4">
            {/* Encabezado */}
            <div className="rounded-xl p-4 text-white" style={{ background: 'linear-gradient(135deg, #485935 0%, #1B4332 100%)' }}>
                <h1 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp size={20} /> Ganancias Reales
                </h1>
                <p className="text-xs opacity-80 mt-1">
                    Basado en ventas reales | Ahorro: {datos.porcentaje_ahorro}% | Comisión: {datos.porcentaje_comision}%
                </p>
            </div>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border" style={{ borderColor: '#CADBB7' }}>
                    <DollarSign size={18} className="mx-auto mb-1" style={{ color: '#D97757' }} />
                    <p className="text-[11px]" style={{ color: '#93A267' }}>💰 Total Ventas</p>
                    <p className="text-base font-bold" style={{ color: '#1B4332' }}>${datos.total_ventas.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border" style={{ borderColor: '#CADBB7' }}>
                    <TrendingUp size={18} className="mx-auto mb-1" style={{ color: '#D97757' }} />
                    <p className="text-[11px]" style={{ color: '#93A267' }}>✅ Ganancia Real</p>
                    <p className="text-base font-bold" style={{ color: '#D97757' }}>${datos.total_ganancia.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border" style={{ borderColor: '#CADBB7' }}>
                    <Percent size={18} className="mx-auto mb-1" style={{ color: '#D97757' }} />
                    <p className="text-[11px]" style={{ color: '#93A267' }}>💸 Comisión {datos.porcentaje_comision}%</p>
                    <p className="text-sm font-bold" style={{ color: '#D97757' }}>${datos.total_comision.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border" style={{ borderColor: '#CADBB7' }}>
                    <PiggyBank size={18} className="mx-auto mb-1" style={{ color: '#D97757' }} />
                    <p className="text-[11px]" style={{ color: '#93A267' }}>🐷 Ahorro {datos.porcentaje_ahorro}%</p>
                    <p className="text-sm font-bold" style={{ color: '#D97757' }}>${datos.total_ahorro.toFixed(2)}</p>
                </div>
            </div>

            {/* Lista de plantas con ganancia real */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: '#CADBB7' }}>
                <div className="p-3 border-b" style={{ backgroundColor: '#F8FAF9' }}>
                    <p className="text-sm font-bold flex items-center gap-1" style={{ color: '#1B4332' }}>
                        <Leaf size={14} /> Ganancia por planta (solo con ventas)
                    </p>
                </div>
                <div className="divide-y max-h-[400px] overflow-y-auto">
                    {datos.plantas.map((planta) => (
                        <div key={planta.id_planta} className="p-3 flex justify-between items-center">
                            <span className="font-bold text-sm" style={{ color: '#1B4332' }}>{planta.nombre}</span>
                            <span className="text-sm font-bold" style={{ color: '#D97757' }}>
                                ${parseFloat(planta.ganancia_real).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resumen final */}
            <div className="rounded-xl p-3" style={{ backgroundColor: '#E8EFE0' }}>
                <div className="flex justify-between text-xs">
                    <span style={{ color: '#1B4332' }}>🏆 Planta más rentable:</span>
                    <span className="font-bold" style={{ color: '#D97757' }}>
                        {datos.plantas[0]?.nombre} - ${parseFloat(datos.plantas[0]?.ganancia_real).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ReporteGanancias;