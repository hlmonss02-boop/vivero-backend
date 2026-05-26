import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, Package, Search, Filter, DollarSign, Leaf, Warehouse } from 'lucide-react';
import { API_URL } from '../config';

function ReporteGanancias() {
    const [reporte, setReporte] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');
    const [orden, setOrden] = useState('ganancia');

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const isDueño = usuario.rol === 'Dueño';

    useEffect(() => {
        cargarReporte();
    }, []);

    const cargarReporte = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/ventas/ganancias-por-planta`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReporte(response.data);
        } catch (error) {
            console.error('Error cargando reporte:', error);
        } finally {
            setLoading(false);
        }
    };

    const ordenarDatos = (datos) => {
        let sorted = [...datos];
        switch (orden) {
            case 'ganancia':
                sorted.sort((a, b) => b.ganancia - a.ganancia);
                break;
            case 'vendido':
                sorted.sort((a, b) => b.total_vendido - a.total_vendido);
                break;
            case 'cantidad':
                sorted.sort((a, b) => b.cantidad_vendida - a.cantidad_vendida);
                break;
            default:
                break;
        }
        return sorted;
    };

    const datosFiltrados = ordenarDatos(
        reporte.filter(planta =>
            planta.nombre.toLowerCase().includes(filtro.toLowerCase())
        )
    );

    const totalVendido = reporte.reduce((sum, p) => sum + parseFloat(p.total_vendido || 0), 0);
    const totalGanancia = reporte.reduce((sum, p) => sum + parseFloat(p.ganancia || 0), 0);
    const totalCantidad = reporte.reduce((sum, p) => sum + parseInt(p.cantidad_vendida || 0), 0);

    if (!isDueño) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">⛔</div>
                <h1 className="text-2xl font-bold mb-4" style={{ color: '#D97757' }}>Acceso Denegado</h1>
                <p style={{ color: '#93A267' }}>Solo el dueño puede ver este reporte.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: '#485935' }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-80 flex items-center gap-1 text-white">
                                <DollarSign size={16} /> Total Vendido
                            </p>
                            <p className="text-2xl font-bold mt-1 text-white">${totalVendido.toFixed(2)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#93A267' }}>
                            <DollarSign size={24} style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: '#D97757' }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-80 flex items-center gap-1 text-white">
                                <TrendingUp size={16} /> Ganancia Total
                            </p>
                            <p className="text-2xl font-bold mt-1 text-white">${totalGanancia.toFixed(2)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                            <TrendingUp size={24} style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: '#93A267' }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-80 flex items-center gap-1 text-white">
                                <Package size={16} /> Unidades Vendidas
                            </p>
                            <p className="text-2xl font-bold mt-1 text-white">{totalCantidad}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                            <Package size={24} style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros y orden */}
            <div className="bg-white rounded-xl shadow-md p-5 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                        <input
                            type="text"
                            placeholder="Buscar planta por nombre..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                            style={{ borderColor: '#CADBB7' }}
                        />
                    </div>
                    <div className="relative">
                        <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                        <select
                            value={orden}
                            onChange={(e) => setOrden(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border appearance-none focus:outline-none focus:ring-1"
                            style={{ borderColor: '#CADBB7' }}
                        >
                            <option value="ganancia">📈 Ordenar por ganancia</option>
                            <option value="vendido">💰 Ordenar por total vendido</option>
                            <option value="cantidad">🌱 Ordenar por cantidad vendida</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabla de reporte */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-pulse text-4xl mb-4">📊</div>
                    <p style={{ color: '#93A267' }}>Cargando reporte...</p>
                </div>
            ) : datosFiltrados.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                    <BarChart3 size={48} className="mx-auto mb-3" style={{ color: '#CADBB7' }} />
                    <p style={{ color: '#93A267' }}>No hay ventas registradas aún</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead style={{ backgroundColor: '#485935' }}>
                                <tr>
                                    <th className="p-3 text-left text-white">🌿 Planta</th>
                                    <th className="p-3 text-center text-white">📦 Stock</th>
                                    <th className="p-3 text-center text-white">🌱 Vendidas</th>
                                    <th className="p-3 text-center text-white">💰 Precio</th>
                                    <th className="p-3 text-center text-white">💵 Vendido</th>
                                    <th className="p-3 text-center text-white">📈 Ganancia</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datosFiltrados.map((planta, index) => (
                                    <tr key={planta.id_planta} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`} style={{ borderColor: '#CADBB7' }}>
                                        <td className="p-3 font-bold" style={{ color: '#1B4332' }}>{planta.nombre}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${planta.stock_actual < 20 ? 'text-white' : 'text-white'}`} 
                                                  style={{ backgroundColor: planta.stock_actual < 20 ? '#D97757' : '#93A267' }}>
                                                {planta.stock_actual}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center font-bold" style={{ color: '#1B4332' }}>{planta.cantidad_vendida || 0}</td>
                                        <td className="p-3 text-center" style={{ color: '#1B4332' }}>${parseFloat(planta.precio_base).toFixed(2)}</td>
                                        <td className="p-3 text-center font-bold" style={{ color: '#D97757' }}>${parseFloat(planta.total_vendido || 0).toFixed(2)}</td>
                                        <td className="p-3 text-center">
                                            <span className={`font-bold ${parseFloat(planta.ganancia || 0) > 0 ? '' : ''}`} 
                                                  style={{ color: parseFloat(planta.ganancia || 0) > 0 ? '#93A267' : '#D97757' }}>
                                                ${parseFloat(planta.ganancia || 0).toFixed(2)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Mensaje de resumen */}
            {datosFiltrados.length > 0 && (
                <div className="mt-6 p-5 rounded-xl" style={{ backgroundColor: '#E8EFE0' }}>
                    <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: '#1B4332' }}>
                        <BarChart3 size={18} /> Resumen
                    </h3>
                    <p className="text-sm" style={{ color: '#1B4332' }}>
                        La planta más rentable es <strong style={{ color: '#D97757' }}>{datosFiltrados[0]?.nombre}</strong> 
                        con una ganancia de <strong style={{ color: '#D97757' }}>${parseFloat(datosFiltrados[0]?.ganancia || 0).toFixed(2)}</strong>.
                    </p>
                    <p className="text-sm mt-1" style={{ color: '#1B4332' }}>
                        🌟 Ganancia promedio por producto: <strong>${(totalGanancia / datosFiltrados.length).toFixed(2)}</strong>
                    </p>
                </div>
            )}
        </div>
    );
}

export default ReporteGanancias;