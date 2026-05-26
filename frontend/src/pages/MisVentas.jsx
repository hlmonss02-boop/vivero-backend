import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Receipt, Calendar, User, Eye, DollarSign, CreditCard, 
    TrendingUp, Search, Trash2, Package, Phone, X
} from 'lucide-react';
import { API_URL } from '../config';

function MisVentas() {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
    const [detalles, setDetalles] = useState([]);

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const isDueño = usuario.rol === 'Dueño';

    useEffect(() => {
        cargarVentas();
    }, []);

    const cargarVentas = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/ventas/mis-ventas`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVentas(response.data);
        } catch (error) {
            console.error('Error cargando ventas:', error);
        } finally {
            setLoading(false);
        }
    };

    const verDetalle = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/ventas/detalle/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVentaSeleccionada(response.data.venta);
            setDetalles(response.data.detalles);
        } catch (error) {
            console.error('Error cargando detalle:', error);
        }
    };

    const cerrarModal = () => {
        setVentaSeleccionada(null);
        setDetalles([]);
    };

    // Eliminar venta
    const eliminarVenta = async (id, folio) => {
        if (!isDueño) {
            alert('Solo el dueño puede eliminar ventas');
            return;
        }
        
        const confirmar = window.confirm(`¿Eliminar la venta ${folio}? Esta acción no se puede deshacer.`);
        if (!confirmar) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/ventas/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Venta eliminada correctamente');
            cargarVentas();
        } catch (error) {
            alert(error.response?.data?.error || 'Error al eliminar venta');
        }
    };

    const ventasFiltradas = ventas.filter(venta =>
        venta.folio_ticket.toLowerCase().includes(filtro.toLowerCase()) ||
        (venta.cliente_nombre && venta.cliente_nombre.toLowerCase().includes(filtro.toLowerCase()))
    );

    const totalVentas = ventas.length;
    const totalIngresos = ventas.reduce((sum, v) => sum + parseFloat(v.total_pagado), 0);

    return (
        <div>
            {/* Estadísticas - SOLO para el DUEÑO */}
            {isDueño && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: '#CADBB7' }}>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm opacity-70 flex items-center gap-1" style={{ color: '#1B4332' }}>
                                    <Receipt size={16} /> Total de ventas
                                </p>
                                <p className="text-3xl font-bold mt-1" style={{ color: '#1B4332' }}>{totalVentas}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#93A267' }}>
                                <Receipt size={24} style={{ color: 'white' }} />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: '#E8EFE0' }}>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm opacity-70 flex items-center gap-1" style={{ color: '#1B4332' }}>
                                    <DollarSign size={16} /> Total ingresos
                                </p>
                                <p className="text-3xl font-bold mt-1" style={{ color: '#1B4332' }}>${totalIngresos.toFixed(2)}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#93A267' }}>
                                <TrendingUp size={24} style={{ color: 'white' }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Buscador */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                    <input
                        type="text"
                        placeholder="Buscar por folio o cliente..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                        style={{ borderColor: '#CADBB7' }}
                    />
                </div>
            </div>

            {/* Lista de ventas */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-pulse text-4xl mb-4">📋</div>
                    <p style={{ color: '#93A267' }}>Cargando ventas...</p>
                </div>
            ) : ventasFiltradas.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                    <Receipt size={48} className="mx-auto mb-3" style={{ color: '#CADBB7' }} />
                    <p style={{ color: '#93A267' }}>No hay ventas registradas</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {ventasFiltradas.map((venta) => (
                        <div key={venta.id_venta} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
                            <div className="p-5" style={{ borderBottom: '1px solid #CADBB7' }}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-bold flex items-center gap-1" style={{ color: '#1B4332' }}>
                                                <Receipt size={14} /> {venta.folio_ticket}
                                            </p>
                                            {isDueño && venta.vendedor_nombre && (
                                                <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: '#E8EFE0', color: '#1B4332' }}>
                                                    <User size={10} /> {venta.vendedor_nombre}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            <p className="text-sm flex items-center gap-1" style={{ color: '#93A267' }}>
                                                <Calendar size={12} /> {new Date(venta.fecha_servidor).toLocaleString()}
                                            </p>
                                            {venta.cliente_nombre && (
                                                <p className="text-sm flex items-center gap-1" style={{ color: '#93A267' }}>
                                                    <User size={12} /> {venta.cliente_nombre}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold flex items-center gap-1 justify-end" style={{ color: '#D97757' }}>
                                            <DollarSign size={18} /> {venta.total_pagado}
                                        </p>
                                        <p className="text-sm flex items-center gap-1 justify-end" style={{ color: '#93A267' }}>
                                            <CreditCard size={12} /> {venta.metodo_pago}
                                        </p>
                                        <div className="flex gap-2 mt-2 justify-end">
                                            <button
                                                onClick={() => verDetalle(venta.id_venta)}
                                                className="text-sm flex items-center gap-1 transition hover:opacity-70"
                                                style={{ color: '#93A267' }}
                                            >
                                                <Eye size={14} /> Ver detalle
                                            </button>
                                            {isDueño && (
                                                <button
                                                    onClick={() => eliminarVenta(venta.id_venta, venta.folio_ticket)}
                                                    className="text-sm flex items-center gap-1 transition hover:opacity-70"
                                                    style={{ color: '#D97757' }}
                                                >
                                                    <Trash2 size={14} /> Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de detalle */}
            {ventaSeleccionada && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#1B4332' }}>
                                <Receipt size={20} style={{ color: '#D97757' }} /> Detalle de Venta
                            </h2>
                            <button onClick={cerrarModal} className="text-gray-400 text-2xl hover:text-gray-600">&times;</button>
                        </div>
                        
                        <div className="border-b pb-3 mb-3" style={{ borderColor: '#CADBB7' }}>
                            <p className="flex items-center gap-2"><strong>Folio:</strong> {ventaSeleccionada.folio_ticket}</p>
                            <p className="flex items-center gap-2 mt-1"><strong>Fecha:</strong> {new Date(ventaSeleccionada.fecha_servidor).toLocaleString()}</p>
                            {ventaSeleccionada.cliente_nombre && (
                                <p className="flex items-center gap-2 mt-1"><strong>Cliente:</strong> {ventaSeleccionada.cliente_nombre}</p>
                            )}
                            <p className="flex items-center gap-2 mt-1"><strong>Método de pago:</strong> {ventaSeleccionada.metodo_pago}</p>
                        </div>
                        
                        <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: '#1B4332' }}>
                            <Package size={14} style={{ color: '#D97757' }} /> Productos:
                        </h3>
                        <div className="space-y-2 mb-4">
                            {detalles.map((item, idx) => (
                                <div key={idx} className="border-b pb-2 text-sm" style={{ borderColor: '#CADBB7' }}>
                                    <p className="font-bold" style={{ color: '#1B4332' }}>{item.planta_nombre}</p>
                                    <p style={{ color: '#93A267' }}>
                                        {item.cantidad} {item.unidad_medida} x ${item.precio_pactado} = ${item.subtotal}
                                    </p>
                                </div>
                            ))}
                        </div>
                        
                        <div className="border-t pt-3" style={{ borderColor: '#CADBB7' }}>
                            <p className="text-xl font-bold text-right flex items-center justify-end gap-2" style={{ color: '#D97757' }}>
                                Total: ${ventaSeleccionada.total_pagado}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MisVentas;