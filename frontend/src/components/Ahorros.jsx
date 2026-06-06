import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { PiggyBank, Save, History, DollarSign, TrendingUp } from 'lucide-react';

function Ahorros() {
    const [porcentaje, setPorcentaje] = useState(20);
    const [totalAhorrado, setTotalAhorrado] = useState(0);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editando, setEditando] = useState(false);
    const [nuevoPorcentaje, setNuevoPorcentaje] = useState(20);

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const isDueño = usuario.rol === 'Dueño';

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            const porcentajeRes = await axios.get(`${API_URL}/ahorros/porcentaje`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const totalRes = await axios.get(`${API_URL}/ahorros/total`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const historialRes = await axios.get(`${API_URL}/ahorros/historial`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setPorcentaje(porcentajeRes.data.porcentaje);
            setNuevoPorcentaje(porcentajeRes.data.porcentaje);
            setTotalAhorrado(totalRes.data.total_ahorrado);
            setHistorial(historialRes.data);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const guardarPorcentaje = async () => {
        if (nuevoPorcentaje < 0 || nuevoPorcentaje > 100) {
            alert('El porcentaje debe estar entre 0 y 100');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/ahorros/porcentaje`, 
                { porcentaje: nuevoPorcentaje },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPorcentaje(nuevoPorcentaje);
            setEditando(false);
            alert(`Porcentaje actualizado a ${nuevoPorcentaje}%`);
        } catch (error) {
            console.error('Error al guardar:', error);
            alert(error.response?.data?.error || 'Error al actualizar porcentaje');
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-pulse">
                    <PiggyBank size={48} className="mx-auto mb-4" style={{ color: '#CADBB7' }} />
                    <p style={{ color: '#93A267' }}>Cargando datos de ahorros...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Tarjeta principal - Total ahorrado */}
            <div className="rounded-2xl shadow-lg overflow-hidden" style={{ backgroundColor: '#485935' }}>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm flex items-center gap-2 text-white opacity-80">
                                <PiggyBank size={18} /> Total ahorrado para renta
                            </p>
                            <p className="text-4xl font-bold mt-2 text-white">
                                ${totalAhorrado.toLocaleString()}
                            </p>
                            <p className="text-xs mt-2 text-white opacity-60">
                                Acumulado desde el inicio
                            </p>
                        </div>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#D97757' }}>
                            <PiggyBank size={32} style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Configuración de porcentaje (solo dueño) */}
            {isDueño && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: '#1B4332' }}>
                        <Save size={18} style={{ color: '#D97757' }} />
                        Configuración de ahorro
                    </h3>
                    
                    {!editando ? (
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <p className="text-sm" style={{ color: '#93A267' }}>Porcentaje actual</p>
                                <p className="text-3xl font-bold" style={{ color: '#D97757' }}>{porcentaje}%</p>
                                <p className="text-xs mt-1" style={{ color: '#93A267' }}>
                                    De cada venta, se aparta {porcentaje}% para la renta
                                </p>
                            </div>
                            <button
                                onClick={() => setEditando(true)}
                                className="px-5 py-2 rounded-lg font-semibold transition hover:opacity-80 text-white"
                                style={{ backgroundColor: '#D97757' }}
                            >
                                Cambiar porcentaje
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2" style={{ color: '#1B4332' }}>
                                    Nuevo porcentaje (%):
                                </label>
                                <div className="flex gap-3 flex-wrap">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={nuevoPorcentaje}
                                        onChange={(e) => setNuevoPorcentaje(Number(e.target.value))}
                                        className="w-32 px-4 py-2 border rounded-lg text-center text-lg font-bold"
                                        style={{ borderColor: '#CADBB7' }}
                                        autoFocus
                                    />
                                    <button
                                        onClick={guardarPorcentaje}
                                        className="px-5 py-2 rounded-lg font-semibold text-white"
                                        style={{ backgroundColor: '#485935' }}
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditando(false);
                                            setNuevoPorcentaje(porcentaje);
                                        }}
                                        className="px-5 py-2 rounded-lg font-semibold"
                                        style={{ backgroundColor: '#CADBB7', color: '#1B4332' }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs" style={{ color: '#93A267' }}>
                                💡 El nuevo porcentaje se aplicará automáticamente a todas las ventas a partir de ahora
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Estadística rápida */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E8EFE0' }}>
                        <TrendingUp size={18} style={{ color: '#485935' }} />
                    </div>
                    <div>
                        <p className="text-xs" style={{ color: '#93A267' }}>Aportes registrados</p>
                        <p className="text-xl font-bold" style={{ color: '#1B4332' }}>{historial.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E8EFE0' }}>
                        <DollarSign size={18} style={{ color: '#485935' }} />
                    </div>
                    <div>
                        <p className="text-xs" style={{ color: '#93A267' }}>Promedio por aporte</p>
                        <p className="text-xl font-bold" style={{ color: '#1B4332' }}>
                            ${historial.length > 0 
                                ? (totalAhorrado / historial.length).toLocaleString(undefined, { maximumFractionDigits: 0 })
                                : 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Historial de ahorros */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 border-b" style={{ borderColor: '#CADBB7' }}>
                    <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#1B4332' }}>
                        <History size={18} style={{ color: '#D97757' }} />
                        Historial de ahorros
                    </h3>
                </div>
                
                {historial.length === 0 ? (
                    <div className="p-8 text-center">
                        <PiggyBank size={40} className="mx-auto mb-3" style={{ color: '#CADBB7' }} />
                        <p style={{ color: '#93A267' }}>No hay movimientos de ahorro registrados</p>
                        <p className="text-sm mt-1" style={{ color: '#CADBB7' }}>
                            Los ahorros se generan automáticamente con cada venta
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead style={{ backgroundColor: '#F8FAF9' }}>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#1B4332' }}>Fecha</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#1B4332' }}>Porcentaje</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#1B4332' }}>Monto ahorrado</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#1B4332' }}>Venta</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historial.map((item, index) => (
                                    <tr key={item.id || index} className="border-t" style={{ borderColor: '#CADBB7' }}>
                                        <td className="px-4 py-3 text-sm" style={{ color: '#1B4332' }}>
                                            {new Date(item.fecha).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#E8EFE0', color: '#485935' }}>
                                                {item.porcentaje}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-medium" style={{ color: '#D97757' }}>
                                                ${Number(item.monto_ahorrado).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs" style={{ color: '#93A267' }}>
                                            {item.folio_ticket || `Venta #${item.id_venta}`}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Ahorros;