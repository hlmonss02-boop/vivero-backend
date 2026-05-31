import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Receipt, Calendar, User, Eye, DollarSign, CreditCard, 
    TrendingUp, Search, Trash2, Package
} from 'lucide-react';

const API_URL = 'http://localhost:3000/api';

function MisVentas() {
    const [ventas, setVentas] = useState([]);
    const [ventasFiltradas, setVentasFiltradas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');
    const [filtroFecha, setFiltroFecha] = useState('todos'); // todos, dia, semana, mes
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
            aplicarFiltroFecha(response.data, filtroFecha);
        } catch (error) {
            console.error('Error cargando ventas:', error);
        } finally {
            setLoading(false);
        }
    };

    // Función para filtrar por fecha
    const aplicarFiltroFecha = (lista, tipo) => {
        if (tipo === 'todos') {
            setVentasFiltradas(lista);
            return;
        }
        
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        let fechaLimite = new Date();
        
        switch(tipo) {
            case 'dia':
                fechaLimite = hoy;
                break;
            case 'semana':
                fechaLimite.setDate(hoy.getDate() - 7);
                break;
            case 'mes':
                fechaLimite.setMonth(hoy.getMonth() - 1);
                break;
            default:
                fechaLimite = hoy;
        }
        
        const filtradas = lista.filter(venta => {
            const fechaVenta = new Date(venta.fecha_servidor);
            return fechaVenta >= fechaLimite;
        });
        
        setVentasFiltradas(filtradas);
    };

    const handleFiltroFechaChange = (tipo) => {
        setFiltroFecha(tipo);
        aplicarFiltroFecha(ventas, tipo);
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

    // Filtrar por texto (folio o cliente)
    const ventasPorTexto = ventasFiltradas.filter(venta =>
        venta.folio_ticket.toLowerCase().includes(filtro.toLowerCase()) ||
        (venta.cliente_nombre && venta.cliente_nombre.toLowerCase().includes(filtro.toLowerCase()))
    );

    const totalVentas = ventasFiltradas.length;
    const totalIngresos = ventasFiltradas.reduce((sum, v) => sum + parseFloat(v.total_pagado), 0);

    return (
        <div>
            {/* Estadísticas */}
            {isDueño && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: '#CADBB7' }}>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm opacity-70 flex items-center gap-1" style={{ color: '#1B4332' }}>
                                    <Receipt size={16} /> Ventas realizadas
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
                                    <DollarSign size={16} /> Ingresos
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

            {/* Filtros por fecha */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleFiltroFechaChange('todos')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filtroFecha === 'todos' ? 'text-white' : 'bg-gray-100 text-gray-700'}`}
                        style={filtroFecha === 'todos' ? { backgroundColor: '#485935', color: 'white' } : {}}
                    >
                        📅 Todos
                    </button>
                    <button
                        onClick={() => handleFiltroFechaChange('dia')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filtroFecha === 'dia' ? 'text-white' : 'bg-gray-100 text-gray-700'}`}
                        style={filtroFecha === 'dia' ? { backgroundColor: '#485935', color: 'white' } : {}}
                    >
                        📆 Hoy
                    </button>
                    <button
                        onClick={() => handleFiltroFechaChange('semana')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filtroFecha === 'semana' ? 'text-white' : 'bg-gray-100 text-gray-700'}`}
                        style={filtroFecha === 'semana' ? { backgroundColor: '#485935', color: 'white' } : {}}
                    >
                        📊 Última semana
                    </button>
                    <button
                        onClick={() => handleFiltroFechaChange('mes')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filtroFecha === 'mes' ? 'text-white' : 'bg-gray-100 text-gray-700'}`}
                        style={filtroFecha === 'mes' ? { backgroundColor: '#485935', color: 'white' } : {}}
                    >
                        📈 Último mes
                    </button>
                </div>
            </div>

            {/* Buscador por texto */}
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
                <p className="text-center text-gray-500">Cargando ventas...</p>
            ) : ventasPorTexto.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                    <Receipt size={48} className="mx-auto mb-3" style={{ color: '#CADBB7' }} />
                    <p style={{ color: '#93A267' }}>No hay ventas en este período</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {ventasPorTexto.map((venta) => (
                        <div key={venta.id_venta} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
                            <div className="p-5" style={{ borderBottom: '1px solid #CADBB7' }}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                    <div className="flex-1">
                                        <p className="font-bold flex items-center gap-2" style={{ color: '#1B4332' }}>
                                            <Receipt size={14} /> {venta.folio_ticket}
                                            {isDueño && venta.vendedor_nombre && (
                                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E8EFE0', color: '#1B4332' }}>
                                                    <User size={10} className="inline mr-1" /> {venta.vendedor_nombre}
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            <p className="text-sm flex items-center gap-1" style={{ color: '#93A267' }}>
                                                <Calendar size={12} /> {new Date(venta.fecha_servidor).toLocaleDateString()}
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
                                        <button
                                            onClick={() => verDetalle(venta.id_venta)}
                                            className="text-sm flex items-center gap-1 mt-1 transition hover:opacity-70"
                                            style={{ color: '#93A267' }}
                                        >
                                            <Eye size={14} /> Ver detalle
                                        </button>
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
                            <p><strong>Folio:</strong> {ventaSeleccionada.folio_ticket}</p>
                            <p><strong>Fecha:</strong> {new Date(ventaSeleccionada.fecha_servidor).toLocaleString()}</p>
                            {ventaSeleccionada.cliente_nombre && (
                                <p><strong>Cliente:</strong> {ventaSeleccionada.cliente_nombre}</p>
                            )}
                            <p><strong>Método de pago:</strong> {ventaSeleccionada.metodo_pago}</p>
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
                            <p className="text-xl font-bold text-right" style={{ color: '#D97757' }}>Total: ${ventaSeleccionada.total_pagado}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MisVentas;