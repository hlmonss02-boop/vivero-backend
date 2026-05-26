import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    CheckCircle, 
    Clock, 
    Eye, 
    Plus, 
    Search,
    Phone,
    Trash2,
    ClipboardList,
    Truck,
    User,
    Calendar,
    FileText,
    ShoppingBag,
    X,
    Save,
    Package
} from 'lucide-react';
import { API_URL } from '../config';

function PedidosClientes() {
    const [pedidos, setPedidos] = useState([]);
    const [plantas, setPlantas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [verDetalle, setVerDetalle] = useState(null);
    const [search, setSearch] = useState('');

    // Estado del formulario
    const [cliente, setCliente] = useState('');
    const [telefono, setTelefono] = useState('');
    const [fechaEntrega, setFechaEntrega] = useState('');
    const [notas, setNotas] = useState('');
    
    // Productos del pedido
    const [productosPedido, setProductosPedido] = useState([]);
    
    // Producto a agregar
    const [plantaSeleccionada, setPlantaSeleccionada] = useState('');
    const [unidad, setUnidad] = useState('Pieza');
    const [cantidad, setCantidad] = useState(1);
    const [precioPactado, setPrecioPactado] = useState('');

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const isDueño = usuario.rol === 'Dueño';

    useEffect(() => {
        if (isDueño) {
            cargarPedidos();
            cargarPlantas();
        }
    }, []);

    const cargarPedidos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/pedidos-clientes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPedidos(response.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarPlantas = async () => {
        try {
            const response = await axios.get(`${API_URL}/plantas`);
            setPlantas(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const agregarProducto = () => {
        if (!plantaSeleccionada) {
            alert('Seleccione una planta');
            return;
        }
        
        const cantidadNum = parseInt(cantidad);
        if (isNaN(cantidadNum) || cantidadNum <= 0) {
            alert('Ingrese una cantidad válida');
            return;
        }
        
        const precioNum = parseFloat(precioPactado);
        if (isNaN(precioNum) || precioNum <= 0) {
            alert('Ingrese un precio pactado válido');
            return;
        }
        
        const planta = plantas.find(p => p.id_planta == plantaSeleccionada);
        const subtotal = cantidadNum * precioNum;
        
        setProductosPedido([...productosPedido, {
            id_planta: planta.id_planta,
            nombre: planta.nombre,
            cantidad: cantidadNum,
            precio: precioNum,
            subtotal: subtotal,
            unidad: unidad
        }]);
        
        // Limpiar campos
        setPlantaSeleccionada('');
        setCantidad(1);
        setPrecioPactado('');
        setUnidad('Pieza');
    };

    const eliminarProducto = (index) => {
        setProductosPedido(productosPedido.filter((_, i) => i !== index));
    };

    const totalPedido = productosPedido.reduce((sum, p) => sum + p.subtotal, 0);

    const registrarPedido = async () => {
        if (!cliente.trim()) {
            alert('El nombre del cliente es requerido');
            return;
        }
        
        if (productosPedido.length === 0) {
            alert('Agregue al menos un producto');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            
            const data = {
                cliente_nombre: cliente,
                cliente_telefono: telefono || null,
                fecha_entrega: fechaEntrega || null,
                notas: notas || null,
                productos: productosPedido.map(p => ({
                    id_planta: p.id_planta,
                    cantidad: p.cantidad,
                    precio_pactado: p.precio,
                    unidad_medida: p.unidad
                }))
            };
            
            await axios.post(`${API_URL}/pedidos-clientes`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert('✅ Pedido registrado exitosamente');
            
            // Limpiar formulario
            setCliente('');
            setTelefono('');
            setFechaEntrega('');
            setNotas('');
            setProductosPedido([]);
            setShowForm(false);
            cargarPedidos();
            
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al registrar pedido');
        }
    };

    const completarPedido = async (id) => {
        if (!confirm('¿Marcar este pedido como completado?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/pedidos-clientes/${id}/estado`, { estado: 'Completado' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ Pedido marcado como completado');
            cargarPedidos();
        } catch (error) {
            alert('Error al completar pedido');
        }
    };

    const eliminarPedido = async (id, folio) => {
        if (!confirm(`¿Eliminar pedido ${folio}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/pedidos-clientes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('🗑️ Pedido eliminado');
            cargarPedidos();
        } catch (error) {
            alert('Error al eliminar pedido');
        }
    };

    const getEstadoColor = (estado) => {
        if (estado === 'Pendiente') return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    const getEstadoIcono = (estado) => {
        if (estado === 'Pendiente') return <Clock size={14} />;
        return <CheckCircle size={14} />;
    };

    const pedidosFiltrados = pedidos.filter(p =>
        p.cliente_nombre?.toLowerCase().includes(search.toLowerCase()) ||
        p.folio?.toLowerCase().includes(search.toLowerCase())
    );

    const pendientesCount = pedidos.filter(p => p.estado === 'Pendiente').length;
    const completadosCount = pedidos.filter(p => p.estado === 'Completado').length;

    if (!isDueño) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">⛔</div>
                <h1 className="text-2xl font-bold mb-4" style={{ color: '#D97757' }}>Acceso Denegado</h1>
                <p style={{ color: '#93A267' }}>Solo el dueño puede gestionar pedidos.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: '#D97757' }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-90 flex items-center gap-1 text-white">
                                <Clock size={16} /> Pedidos pendientes
                            </p>
                            <p className="text-3xl font-bold mt-1 text-white">{pendientesCount}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                            <ClipboardList size={24} style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: '#485935' }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-90 flex items-center gap-1 text-white">
                                <CheckCircle size={16} /> Pedidos completados
                            </p>
                            <p className="text-3xl font-bold mt-1 text-white">{completadosCount}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#93A267' }}>
                            <CheckCircle size={24} style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Botón nuevo pedido */}
            <button
                onClick={() => {
                    setShowForm(!showForm);
                    if (!showForm) {
                        setCliente('');
                        setTelefono('');
                        setFechaEntrega('');
                        setNotas('');
                        setProductosPedido([]);
                    }
                }}
                className="mb-6 px-6 py-3 rounded-lg font-semibold transition hover:opacity-90 flex items-center gap-2 text-white"
                style={{ backgroundColor: '#D97757' }}
            >
                {showForm ? <X size={18} /> : <Plus size={18} />}
                {showForm ? 'Cancelar' : 'Nuevo Pedido'}
            </button>

            {/* Formulario */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-md mb-6 overflow-hidden">
                    <div className="p-5" style={{ backgroundColor: '#485935' }}>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                            <ShoppingBag size={20} /> Nuevo Pedido de Cliente
                        </h2>
                    </div>
                    <div className="p-6">
                        {/* Datos del cliente */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                                <input
                                    type="text"
                                    placeholder="Nombre del cliente *"
                                    value={cliente}
                                    onChange={(e) => setCliente(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                                    style={{ borderColor: '#CADBB7' }}
                                />
                            </div>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                                <input
                                    type="tel"
                                    placeholder="Teléfono"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                                    style={{ borderColor: '#CADBB7' }}
                                />
                            </div>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                                <input
                                    type="date"
                                    placeholder="Fecha de entrega"
                                    value={fechaEntrega}
                                    onChange={(e) => setFechaEntrega(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                                    style={{ borderColor: '#CADBB7' }}
                                />
                            </div>
                            <div className="relative md:col-span-2">
                                <FileText size={18} className="absolute left-3 top-4" style={{ color: '#93A267' }} />
                                <textarea
                                    placeholder="Notas adicionales"
                                    value={notas}
                                    onChange={(e) => setNotas(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                                    style={{ borderColor: '#CADBB7' }}
                                    rows="2"
                                />
                            </div>
                        </div>
                        
                        {/* Agregar productos */}
                        <div className="border-t pt-5 mb-5" style={{ borderColor: '#CADBB7' }}>
                            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#1B4332' }}>
                                <Package size={16} style={{ color: '#D97757' }} /> Agregar productos
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                <select
                                    value={plantaSeleccionada}
                                    onChange={(e) => setPlantaSeleccionada(e.target.value)}
                                    className="border p-3 rounded-lg md:col-span-2 focus:outline-none focus:ring-1"
                                    style={{ borderColor: '#CADBB7' }}
                                >
                                    <option value="">🌿 Seleccionar planta</option>
                                    {plantas.map(p => (
                                        <option key={p.id_planta} value={p.id_planta}>
                                            {p.nombre} (${p.precio_base})
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={unidad}
                                    onChange={(e) => setUnidad(e.target.value)}
                                    className="border p-3 rounded-lg focus:outline-none focus:ring-1"
                                    style={{ borderColor: '#CADBB7' }}
                                >
                                    <option value="Pieza">🌱 Pieza</option>
                                    <option value="Ciento">📦 Ciento</option>
                                    <option value="Docena">📦 Docena</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Cantidad"
                                    value={cantidad}
                                    onChange={(e) => setCantidad(e.target.value)}
                                    className="border p-3 rounded-lg focus:outline-none focus:ring-1"
                                    style={{ borderColor: '#CADBB7' }}
                                    min="1"
                                />
                                <input
                                    type="number"
                                    placeholder="Precio pactado *"
                                    value={precioPactado}
                                    onChange={(e) => setPrecioPactado(e.target.value)}
                                    className="border p-3 rounded-lg focus:outline-none focus:ring-1"
                                    style={{ borderColor: '#CADBB7' }}
                                    step="0.01"
                                />
                            </div>
                            {/* Botón AGREGAR - ahora bien visible */}
                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={agregarProducto}
                                    className="w-full md:w-auto px-6 py-3 rounded-lg font-medium transition hover:opacity-80 text-white flex items-center justify-center gap-2"
                                    style={{ backgroundColor: '#D97757' }}
                                >
                                    <Plus size={18} /> Agregar Producto
                                </button>
                            </div>
                        </div>
                        
                        {/* Lista de productos */}
                        {productosPedido.length > 0 && (
                            <div className="rounded-lg p-4 mb-5" style={{ backgroundColor: '#E8EFE0' }}>
                                <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: '#1B4332' }}>
                                    <ShoppingBag size={16} /> Productos del pedido:
                                </h3>
                                {productosPedido.map((p, idx) => (
                                    <div key={idx} className="flex justify-between items-center border-b py-2" style={{ borderColor: '#CADBB7' }}>
                                        <div>
                                            <span className="font-medium" style={{ color: '#1B4332' }}>{p.nombre}</span>
                                            <span className="text-sm ml-2" style={{ color: '#93A267' }}>
                                                {p.cantidad} {p.unidad} x ${p.precio}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold" style={{ color: '#D97757' }}>${p.subtotal}</span>
                                            <button onClick={() => eliminarProducto(idx)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="text-right font-bold pt-2" style={{ color: '#1B4332' }}>
                                    Total: ${totalPedido}
                                </div>
                            </div>
                        )}
                        
                        <button
                            onClick={registrarPedido}
                            className="w-full py-3 rounded-lg font-semibold transition hover:opacity-90 flex items-center justify-center gap-2 text-white"
                            style={{ backgroundColor: '#D97757' }}
                        >
                            <Save size={18} />
                            Registrar Pedido
                        </button>
                    </div>
                </div>
            )}

            {/* Buscador */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o folio..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                        style={{ borderColor: '#CADBB7' }}
                    />
                </div>
            </div>

            {/* Lista de pedidos */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-pulse text-4xl mb-4">📋</div>
                    <p style={{ color: '#93A267' }}>Cargando pedidos...</p>
                </div>
            ) : pedidosFiltrados.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                    <ClipboardList size={48} className="mx-auto mb-3" style={{ color: '#CADBB7' }} />
                    <p style={{ color: '#93A267' }}>No hay pedidos registrados</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {pedidosFiltrados.map((pedido) => (
                        <div key={pedido.id_pedido} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
                            <div className="p-5" style={{ borderBottom: '1px solid #CADBB7' }}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold" style={{ color: '#1B4332' }}>📄 {pedido.folio}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getEstadoColor(pedido.estado)}`}>
                                                {getEstadoIcono(pedido.estado)} {pedido.estado}
                                            </span>
                                        </div>
                                        <p className="font-semibold mt-1" style={{ color: '#1B4332' }}>{pedido.cliente_nombre}</p>
                                        {pedido.cliente_telefono && (
                                            <p className="text-sm mt-1 flex items-center gap-1" style={{ color: '#93A267' }}>
                                                <Phone size={12} /> {pedido.cliente_telefono}
                                            </p>
                                        )}
                                        {pedido.fecha_entrega && (
                                            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#93A267' }}>
                                                <Truck size={12} /> Entrega: {new Date(pedido.fecha_entrega).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold" style={{ color: '#D97757' }}>${pedido.total}</p>
                                        <p className="text-xs" style={{ color: '#93A267' }}>📅 {new Date(pedido.fecha_pedido).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-3 flex flex-wrap gap-2" style={{ backgroundColor: '#F8FAF9' }}>
                                {pedido.estado === 'Pendiente' && (
                                    <button 
                                        onClick={() => completarPedido(pedido.id_pedido)} 
                                        className="px-3 py-1 rounded-lg text-sm font-medium transition hover:opacity-80 flex items-center gap-1 text-white"
                                        style={{ backgroundColor: '#D97757' }}
                                    >
                                        <CheckCircle size={14} /> Marcar Completado
                                    </button>
                                )}
                                <button 
                                    onClick={() => setVerDetalle(pedido.id_pedido)} 
                                    className="px-3 py-1 rounded-lg text-sm font-medium transition hover:opacity-80 flex items-center gap-1"
                                    style={{ backgroundColor: '#CADBB7', color: '#1B4332' }}
                                >
                                    <Eye size={14} /> Ver detalle
                                </button>
                                <button 
                                    onClick={() => eliminarPedido(pedido.id_pedido, pedido.folio)} 
                                    className="text-sm hover:underline ml-auto flex items-center gap-1"
                                    style={{ color: '#D97757' }}
                                >
                                    <Trash2 size={14} /> Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de detalle */}
            {verDetalle && (
                <ModalDetalle id={verDetalle} onClose={() => setVerDetalle(null)} />
            )}
        </div>
    );
}

// Modal de detalle
function ModalDetalle({ id, onClose }) {
    const [pedido, setPedido] = useState(null);
    const [detalles, setDetalles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/pedidos-clientes/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPedido(response.data.pedido);
                setDetalles(response.data.detalles);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [id]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#1B4332' }}>
                        <ClipboardList size={20} style={{ color: '#D97757' }} /> Detalle del Pedido
                    </h2>
                    <button onClick={onClose} className="text-gray-400 text-2xl hover:text-gray-600">&times;</button>
                </div>
                
                {loading ? (
                    <div className="text-center py-10" style={{ color: '#93A267' }}>Cargando...</div>
                ) : (
                    <>
                        <div className="border-b pb-3 mb-3" style={{ borderColor: '#CADBB7' }}>
                            <p><strong>📄 Folio:</strong> {pedido?.folio}</p>
                            <p><strong>👤 Cliente:</strong> {pedido?.cliente_nombre}</p>
                            {pedido?.cliente_telefono && <p><strong>📞 Teléfono:</strong> {pedido?.cliente_telefono}</p>}
                            <p><strong>📅 Fecha pedido:</strong> {new Date(pedido?.fecha_pedido).toLocaleDateString()}</p>
                            {pedido?.fecha_entrega && <p><strong>🚚 Fecha entrega:</strong> {new Date(pedido?.fecha_entrega).toLocaleDateString()}</p>}
                            <p><strong>📊 Estado:</strong> <span className={`px-2 py-0.5 rounded-full text-xs ${pedido?.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{pedido?.estado}</span></p>
                            {pedido?.notas && <p><strong>📝 Notas:</strong> {pedido?.notas}</p>}
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
                            <p className="text-xl font-bold text-right" style={{ color: '#D97757' }}>Total: ${pedido?.total}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default PedidosClientes;