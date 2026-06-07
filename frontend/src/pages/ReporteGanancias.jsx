import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, PiggyBank, Percent, Leaf } from 'lucide-react';
import { API_URL } from '../config';

function ReporteGanancias() {
    const [datos, setDatos] = useState(null);
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
            
            const response = await axios.get(`${API_URL}/ventas/ganancias-reales-por-planta`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('Datos recibidos:', response.data);
            setDatos(response.data);
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
                <p style={{ color: '#93A267' }}>Cargando ganancias reales...</p>
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

    if (!datos || !datos.plantas || datos.plantas.length === 0) {
        return (
            <div className="text-center py-20">
                <Leaf size={48} className="mx-auto mb-3" style={{ color: '#CADBB7' }} />
                <p style={{ color: '#93A267' }}>No hay ventas registradas aún</p>
                <p className="text-xs mt-1" style={{ color: '#CADBB7' }}>Registra ventas para ver las ganancias reales</p>
            </div>
        );
    }

    const plantasConVentas = datos.plantas.filter(p => parseFloat(p.cantidad_vendida) > 0);
    const totalVentas = datos.plantas.reduce((s, p) => s + parseFloat(p.total_vendido || 0), 0);
    const totalAhorro = datos.plantas.reduce((s, p) => s + parseFloat(p.ahorro_total || 0), 0);
    const totalComision = datos.plantas.reduce((s, p) => s + parseFloat(p.comision_total || 0), 0);
    const totalGanancia = datos.plantas.reduce((s, p) => s + parseFloat(p.ganancia_real || 0), 0);

    return (
        <div className="space-y-4 pb-4">
            {/* Encabezado */}
            <div className="rounded-xl p-4 text-white" style={{ background: 'linear-gradient(135deg, #485935 0%, #1B4332 100%)' }}>
                <h1 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp size={20} /> Ganancias Reales
                </h1>
                <p className="text-xs opacity-80 mt-1">
                    Basado en ventas reales | Comisión: 30%
                </p>
                <p className="text-xs opacity-60 mt-1">
                    Ahorro actual: {datos.porcentaje_ahorro_actual}% | {plantasConVentas.length} plantas con ventas
                </p>
            </div>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border" style={{ borderColor: '#CADBB7' }}>
                    <DollarSign size={18} className="mx-auto mb-1" style={{ color: '#D97757' }} />
                    <p className="text-[11px]" style={{ color: '#93A267' }}>💰 Total Ventas</p>
                    <p className="text-base font-bold" style={{ color: '#1B4332' }}>${totalVentas.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border" style={{ borderColor: '#CADBB7' }}>
                    <TrendingUp size={18} className="mx-auto mb-1" style={{ color: '#D97757' }} />
                    <p className="text-[11px]" style={{ color: '#93A267' }}>✅ Ganancia Real</p>
                    <p className="text-base font-bold" style={{ color: '#D97757' }}>${totalGanancia.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border" style={{ borderColor: '#CADBB7' }}>
                    <Percent size={18} className="mx-auto mb-1" style={{ color: '#D97757' }} />
                    <p className="text-[11px]" style={{ color: '#93A267' }}>💸 Comisión 30%</p>
                    <p className="text-sm font-bold" style={{ color: '#D97757' }}>${totalComision.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border" style={{ borderColor: '#CADBB7' }}>
                    <PiggyBank size={18} className="mx-auto mb-1" style={{ color: '#D97757' }} />
                    <p className="text-[11px]" style={{ color: '#93A267' }}>🐷 Ahorro Total</p>
                    <p className="text-sm font-bold" style={{ color: '#D97757' }}>${totalAhorro.toFixed(2)}</p>
                </div>
            </div>

            {/* Lista de plantas con ganancia real */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: '#CADBB7' }}>
                <div className="p-3 border-b" style={{ backgroundColor: '#F8FAF9' }}>
                    <p className="text-sm font-bold flex items-center gap-1" style={{ color: '#1B4332' }}>
                        <Leaf size={14} /> Ganancia por planta
                    </p>
                </div>
                <div className="divide-y max-h-[400px] overflow-y-auto">
                    {datos.plantas.filter(p => parseFloat(p.cantidad_vendida) > 0).map((planta) => (
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
            {datos.plantas.filter(p => parseFloat(p.cantidad_vendida) > 0).length > 0 && (
                <div className="rounded-xl p-3" style={{ backgroundColor: '#E8EFE0' }}>
                    <div className="flex justify-between text-xs">
                        <span style={{ color: '#1B4332' }}>🏆 Planta más rentable:</span>
                        <span className="font-bold" style={{ color: '#D97757' }}>
                            {datos.plantas[0]?.nombre} - ${parseFloat(datos.plantas[0]?.ganancia_real).toFixed(2)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReporteGanancias;