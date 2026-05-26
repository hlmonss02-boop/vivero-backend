import { useState, useEffect } from 'react';
import axios from 'axios';
import { pdf } from '@react-pdf/renderer';
import TicketPDF from '../components/TicketPDF';
import { ShoppingCart, Search, Trash2, Phone, CreditCard, PiggyBank, X } from 'lucide-react';
import { API_URL } from '../config';

function Ventas() {
    const [plantas, setPlantas] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [metodoPago, setMetodoPago] = useState('Efectivo');
    const [clienteNombre, setClienteNombre] = useState('');
    const [clienteTelefono, setClienteTelefono] = useState('');
    const [porcentajeAhorro, setPorcentajeAhorro] = useState(0);
    const [loading, setLoading] = useState(false);
    const [mostrarCarrito, setMostrarCarrito] = useState(false);
    const [cargandoPlantas, setCargandoPlantas] = useState(true);
    const [modalPlanta, setModalPlanta] = useState(null);

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    useEffect(() => {
        cargarPlantas();
    }, []);

    const cargarPlantas = async () => {
        setCargandoPlantas(true);
        try {
            const response = await axios.get(`${API_URL}/plantas`);
            setPlantas(response.data);
        } catch (error) {
            console.error('Error cargando plantas:', error);
        } finally {
            setCargandoPlantas(false);
        }
    };

    const getCategoriaId = (categoria) => {
        if (!categoria) return 'otras';
        const cat = categoria.toLowerCase();
        if (cat === 'ornato' || cat.includes('ornato')) return 'ornato';
        if (cat === 'jardineria' || cat === 'jardinería' || cat.includes('jardin')) return 'jardineria';
        if (cat === 'hierbas' || cat === 'hierbas de olor' || cat.includes('hierba')) return 'hierbas';
        return 'otras';
    };

    const plantasFiltradas = plantas.filter(planta =>
        planta.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (planta.categoria && planta.categoria.toLowerCase().includes(busqueda.toLowerCase()))
    );

    const plantasPorCategoria = {
        ornato: plantasFiltradas.filter(p => getCategoriaId(p.categoria) === 'ornato'),
        jardineria: plantasFiltradas.filter(p => getCategoriaId(p.categoria) === 'jardineria'),
        hierbas: plantasFiltradas.filter(p => getCategoriaId(p.categoria) === 'hierbas'),
        otras: plantasFiltradas.filter(p => getCategoriaId(p.categoria) === 'otras')
    };

    // Agregar al carrito con cálculo correcto
    const agregarAlCarrito = (planta, unidadVenta, cantidad, precioPactado) => {
        const cantidadPorUnidad = unidadVenta === 'Ciento' ? 100 : unidadVenta === 'Docena' ? 12 : 1;
        const cantidadReal = cantidad * cantidadPorUnidad;
        // Subtotal = cantidad de unidades (cientos/docenas/piezas) × precio pactado
        const subtotal = cantidad * precioPactado;

        const nuevoItem = {
            id_planta: planta.id_planta,
            nombre: planta.nombre,
            precio_base: planta.precio_base,
            precio_pactado: precioPactado,
            cantidad: cantidad,
            cantidad_real: cantidadReal,
            unidad_medida: unidadVenta,
            subtotal: subtotal
        };

        setCarrito([...carrito, nuevoItem]);
    };

    const eliminarDelCarrito = (index) => {
        const nuevoCarrito = carrito.filter((_, i) => i !== index);
        setCarrito(nuevoCarrito);
    };

    // Cancelar toda la venta
    const cancelarVenta = () => {
        if (window.confirm('¿Cancelar toda la venta? Se perderán los productos agregados.')) {
            setCarrito([]);
            setClienteNombre('');
            setClienteTelefono('');
            setMostrarCarrito(false);
        }
    };

    const totalCarrito = carrito.reduce((sum, item) => sum + item.subtotal, 0);

    const handleVenta = async () => {
        if (carrito.length === 0) {
            alert('Agrega productos al carrito');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const ventaData = {
                carrito: carrito,
                total_pagado: totalCarrito,
                metodo_pago: metodoPago,
                id_usuario: usuario.id_usuario,
                cliente_nombre: clienteNombre,
                cliente_telefono: clienteTelefono,
                porcentaje_ahorro: porcentajeAhorro
            };

            const response = await axios.post(`${API_URL}/ventas`, ventaData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            generarTicketPDF(response.data.venta, carrito, totalCarrito, response.data.folio);

            alert(`✅ Venta registrada exitosamente\nFolio: ${response.data.folio}`);

            setCarrito([]);
            setClienteNombre('');
            setClienteTelefono('');
            setMostrarCarrito(false);
            cargarPlantas();

        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error al registrar venta');
        } finally {
            setLoading(false);
        }
    };

    const generarTicketPDF = async (venta, carrito, total, folio) => {
        try {
            const blob = await pdf(
                <TicketPDF
                    venta={venta}
                    carrito={carrito}
                    total={total}
                    folio={folio}
                    vendedor={usuario.nombre}
                />
            ).toBlob();

            const pdfUrl = URL.createObjectURL(blob);

            if (clienteTelefono) {
                const mensaje = `🌿 VIVERO JUANITO 🌿\n\n📄 Folio: ${folio}\n💰 Total: $${total}\n\nAdjunto encontrará su ticket en PDF.\n\n¡Gracias por su compra!`;
                const urlWhatsApp = `https://wa.me/${clienteTelefono}?text=${encodeURIComponent(mensaje)}`;
                window.open(urlWhatsApp, '_blank');
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = `ticket_${folio}.pdf`;
                link.click();
            } else {
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = `ticket_${folio}.pdf`;
                link.click();
            }
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Error al generar el ticket PDF');
        }
    };

    // Modal para agregar producto con cambio automático de precio
    const ModalAgregar = ({ planta, onClose, onAgregar }) => {
        const [unidadVenta, setUnidadVenta] = useState('Pieza');
        const [cantidad, setCantidad] = useState(1);
        
        const getPrecioPorUnidad = () => {
            if (unidadVenta === 'Ciento' && planta.precio_ciento > 0) {
                return planta.precio_ciento;
            }
            if (unidadVenta === 'Docena' && planta.precio_docena > 0) {
                return planta.precio_docena;
            }
            return planta.precio_base;
        };
        
        const [precioNegociado, setPrecioNegociado] = useState(planta.precio_base);
        
        useEffect(() => {
            const nuevoPrecio = getPrecioPorUnidad();
            setPrecioNegociado(nuevoPrecio);
        }, [unidadVenta]);

        const handleAgregar = () => {
            onAgregar(planta, unidadVenta, cantidad, precioNegociado);
            onClose();
        };

        const unidadesReales = cantidad * (unidadVenta === 'Ciento' ? 100 : unidadVenta === 'Docena' ? 12 : 1);

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4" style={{ color: '#1B4332' }}>{planta.nombre}</h2>
                    
                    <label className="block mb-2 font-bold" style={{ color: '#1B4332' }}>Unidad de venta:</label>
                    <select 
                        value={unidadVenta} 
                        onChange={(e) => setUnidadVenta(e.target.value)} 
                        className="w-full border p-3 rounded-lg mb-4" 
                        style={{ borderColor: '#CADBB7' }}
                    >
                        <option value="Pieza">🌱 Por pieza - ${planta.precio_base}</option>
                        {planta.precio_ciento > 0 && (
                            <option value="Ciento">📦 Por ciento (100 pzs) - ${planta.precio_ciento}</option>
                        )}
                        {planta.precio_docena > 0 && (
                            <option value="Docena">📦 Por docena (12 pzs) - ${planta.precio_docena}</option>
                        )}
                    </select>
                    
                    <label className="block mb-2 font-bold" style={{ color: '#1B4332' }}>
                        Cantidad ({unidadVenta === 'Ciento' ? 'cientos' : unidadVenta === 'Docena' ? 'docenas' : 'piezas'}):
                    </label>
                    <input 
                        type="number" 
                        min="1" 
                        value={cantidad} 
                        onChange={(e) => setCantidad(Number(e.target.value))} 
                        className="w-full border p-3 rounded-lg mb-4" 
                        style={{ borderColor: '#CADBB7' }} 
                    />
                    
                    <label className="block mb-2 font-bold" style={{ color: '#1B4332' }}>Precio por unidad ($):</label>
                    <input 
                        type="number" 
                        step="0.01" 
                        value={precioNegociado} 
                        onChange={(e) => setPrecioNegociado(Number(e.target.value))} 
                        className="w-full border p-3 rounded-lg mb-4" 
                        style={{ borderColor: '#CADBB7' }} 
                    />
                    <p className="text-xs mb-4" style={{ color: '#93A267' }}>
                        💡 El precio se actualiza automáticamente al cambiar la unidad. Puedes ajustarlo manualmente si negocias con el cliente.
                    </p>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <p className="text-sm font-medium" style={{ color: '#1B4332' }}>
                            Subtotal estimado: <span className="font-bold" style={{ color: '#D97757' }}>${(cantidad * precioNegociado).toLocaleString()}</span>
                        </p>
                        <p className="text-xs" style={{ color: '#93A267' }}>
                            {cantidad} {unidadVenta === 'Ciento' ? 'cientos' : unidadVenta === 'Docena' ? 'docenas' : 'piezas'} = {unidadesReales} piezas
                        </p>
                    </div>
                    
                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 bg-gray-200 p-3 rounded-lg" style={{ color: '#1B4332' }}>Cancelar</button>
                        <button onClick={handleAgregar} className="flex-1 p-3 rounded-lg text-white" style={{ backgroundColor: '#D97757' }}>Agregar</button>
                    </div>
                </div>
            </div>
        );
    };

    const SeccionCategoria = ({ titulo, icono, plantas: lista, colorBg }) => {
        if (lista.length === 0) return null;
        return (
            <div className="mb-8">
                <div className={`${colorBg} rounded-xl p-2 mb-3`}>
                    <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#1B4332' }}>
                        <span>{icono}</span> {titulo}
                        <span className="text-xs px-2 py-0.5 rounded-full ml-2" style={{ backgroundColor: '#CADBB7', color: '#1B4332' }}>{lista.length}</span>
                    </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {lista.map((planta) => (
                        <div key={planta.id_planta} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                            <div className="h-24 bg-gradient-to-br from-green-50 to-gray-50 rounded-t-xl flex items-center justify-center overflow-hidden">
                                {planta.imagen_url ? (
                                    <img src={planta.imagen_url} alt={planta.nombre} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl">🌿</span>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="font-bold text-sm truncate" style={{ color: '#1B4332' }}>{planta.nombre}</h3>
                                <div className="mt-1 space-y-0.5">
                                    <p className="text-xs" style={{ color: '#93A267' }}>💵 Pieza: ${planta.precio_base}</p>
                                    {planta.precio_ciento > 0 && (
                                        <p className="text-xs" style={{ color: '#93A267' }}>📦 Ciento: ${planta.precio_ciento}</p>
                                    )}
                                    {planta.precio_docena > 0 && (
                                        <p className="text-xs" style={{ color: '#93A267' }}>📦 Docena: ${planta.precio_docena}</p>
                                    )}
                                </div>
                                <p className={`text-xs ${planta.stock < 20 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>Stock: {planta.stock}</p>
                                <button
                                    onClick={() => setModalPlanta(planta)}
                                    disabled={planta.stock === 0}
                                    className="w-full mt-2 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 text-white"
                                    style={{ backgroundColor: '#D97757' }}
                                >
                                    {planta.stock === 0 ? 'Sin stock' : '+ Vender'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="pb-24">
            {/* Buscador */}
            <div className="mb-4">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                    <input
                        type="text"
                        placeholder="Buscar planta por nombre o categoría..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-1"
                        style={{ borderColor: '#CADBB7', backgroundColor: 'white', color: '#1B4332' }}
                        autoFocus
                    />
                </div>
            </div>

            {/* Lista de plantas por categoría */}
            {cargandoPlantas ? (
                <div className="text-center py-20">
                    <div className="animate-pulse text-4xl mb-4">🌿</div>
                    <p style={{ color: '#93A267' }}>Cargando plantas...</p>
                </div>
            ) : plantasFiltradas.length === 0 ? (
                <div className="text-center py-20">
                    <p style={{ color: '#93A267' }}>No hay plantas disponibles</p>
                </div>
            ) : (
                <>
                    <SeccionCategoria titulo="Ornato" icono="🌸" plantas={plantasPorCategoria.ornato} colorBg="bg-pink-50" />
                    <SeccionCategoria titulo="Jardinería" icono="🌳" plantas={plantasPorCategoria.jardineria} colorBg="bg-blue-50" />
                    <SeccionCategoria titulo="Hierbas de olor" icono="🌱" plantas={plantasPorCategoria.hierbas} colorBg="bg-green-50" />
                    <SeccionCategoria titulo="Otras categorías" icono="📦" plantas={plantasPorCategoria.otras} colorBg="bg-gray-50" />
                </>
            )}

            {/* Botón flotante del carrito */}
            {carrito.length > 0 && (
                <button
                    onClick={() => setMostrarCarrito(true)}
                    className="fixed bottom-5 right-5 shadow-lg rounded-full p-4 flex items-center gap-2 z-20 transition hover:scale-105"
                    style={{ backgroundColor: '#D97757', color: 'white' }}
                >
                    <ShoppingCart size={20} /> {carrito.length} - ${totalCarrito}
                </button>
            )}

            {/* Modal del carrito */}
            {mostrarCarrito && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#1B4332' }}>
                                <ShoppingCart size={20} style={{ color: '#D97757' }} /> Carrito
                            </h2>
                            <button onClick={() => setMostrarCarrito(false)} className="text-gray-400 text-2xl hover:text-gray-600">&times;</button>
                        </div>

                        {carrito.length === 0 ? (
                            <p className="text-center py-10" style={{ color: '#93A267' }}>Carrito vacío</p>
                        ) : (
                            <>
                                {carrito.map((item, index) => (
                                    <div key={index} className="border-b pb-3 mb-3" style={{ borderColor: '#CADBB7' }}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold" style={{ color: '#1B4332' }}>{item.nombre}</p>
                                                <p className="text-sm" style={{ color: '#93A267' }}>{item.cantidad} {item.unidad_medida} x ${item.precio_pactado}</p>
                                                <p className="text-xs text-gray-400">Unidades: {item.cantidad_real} pzs</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold" style={{ color: '#D97757' }}>${item.subtotal}</p>
                                                <button onClick={() => eliminarDelCarrito(index)} className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                    <Trash2 size={12} /> Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="border-t pt-3 mt-2" style={{ borderColor: '#CADBB7' }}>
                                    <p className="text-xl font-bold text-right" style={{ color: '#1B4332' }}>Total: ${totalCarrito}</p>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                                        <input 
                                            type="text" 
                                            placeholder="Nombre del cliente" 
                                            value={clienteNombre} 
                                            onChange={(e) => setClienteNombre(e.target.value)} 
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border" 
                                            style={{ borderColor: '#CADBB7' }} 
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                                        <input 
                                            type="tel" 
                                            placeholder="Teléfono para WhatsApp" 
                                            value={clienteTelefono} 
                                            onChange={(e) => setClienteTelefono(e.target.value)} 
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border" 
                                            style={{ borderColor: '#CADBB7' }} 
                                        />
                                    </div>
                                    <div className="relative">
                                        <CreditCard size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                                        <select 
                                            value={metodoPago} 
                                            onChange={(e) => setMetodoPago(e.target.value)} 
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border appearance-none" 
                                            style={{ borderColor: '#CADBB7' }}
                                        >
                                            <option value="Efectivo">💵 Efectivo</option>
                                            <option value="Transferencia">🏦 Transferencia</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1 flex items-center gap-2" style={{ color: '#1B4332' }}>
                                            <PiggyBank size={16} style={{ color: '#D97757' }} /> Ahorro para renta: {porcentajeAhorro}%
                                        </label>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="20" 
                                            value={porcentajeAhorro} 
                                            onChange={(e) => setPorcentajeAhorro(Number(e.target.value))} 
                                            className="w-full" 
                                            style={{ accentColor: '#D97757' }} 
                                        />
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex gap-3 mt-6">
                                    <button 
                                        onClick={cancelarVenta} 
                                        className="flex-1 py-3 rounded-lg font-semibold transition hover:opacity-80 flex items-center justify-center gap-1"
                                        style={{ backgroundColor: '#FCE4E4', color: '#D97757' }}
                                    >
                                        <X size={16} /> Cancelar Venta
                                    </button>
                                    <button 
                                        onClick={() => setMostrarCarrito(false)} 
                                        className="flex-1 py-3 rounded-lg font-semibold transition hover:opacity-80"
                                        style={{ backgroundColor: '#CADBB7', color: '#1B4332' }}
                                    >
                                        Seguir comprando
                                    </button>
                                    <button 
                                        onClick={handleVenta} 
                                        disabled={loading} 
                                        className="flex-1 py-3 rounded-lg font-semibold transition hover:opacity-80 disabled:opacity-50 text-white"
                                        style={{ backgroundColor: '#D97757' }}
                                    >
                                        {loading ? 'Procesando...' : '💸 Pagar'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de agregar producto */}
            {modalPlanta && (
                <ModalAgregar planta={modalPlanta} onClose={() => setModalPlanta(null)} onAgregar={agregarAlCarrito} />
            )}
        </div>
    );
}

export default Ventas;