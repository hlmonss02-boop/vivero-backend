import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Leaf, Search, Plus, Edit2, Trash2, Save, X, Package,
    DollarSign, Truck, Tag, Image, FileText, AlertCircle,
    Flower2, Trees, Sprout, FolderOpen, Box, TrendingUp
} from 'lucide-react';
import { API_URL } from '../config';

function Plantas() {
    const [plantas, setPlantas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editando, setEditando] = useState(null);
    const [proveedores, setProveedores] = useState([]);
    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        categoria: '',
        precio_base: '',
        precio_ciento: '',
        precio_docena: '',
        stock: 0,
        unidad_medida: 'Pieza',
        costo_compra: 0,
        imagen: null,
        id_proveedor: ''
    });

    useEffect(() => {
        cargarPlantas();
        cargarProveedores();
    }, []);

    const cargarPlantas = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/plantas`);
            setPlantas(response.data);
        } catch (error) {
            console.error('Error cargando plantas:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarProveedores = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const response = await axios.get(`${API_URL}/proveedores`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProveedores(response.data);
        } catch (error) {
            console.error('Error cargando proveedores:', error);
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

    const getIconoCategoria = (categoria) => {
        const catId = getCategoriaId(categoria);
        switch (catId) {
            case 'ornato': return <Flower2 size={12} />;
            case 'jardineria': return <Trees size={12} />;
            case 'hierbas': return <Sprout size={12} />;
            default: return <FolderOpen size={12} />;
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('nombre', form.nombre);
        formData.append('descripcion', form.descripcion);
        formData.append('categoria', form.categoria);
        formData.append('precio_base', form.precio_base);
        formData.append('precio_ciento', form.precio_ciento || 0);
        formData.append('precio_docena', form.precio_docena || 0);
        formData.append('stock', form.stock);
        formData.append('unidad_medida', form.unidad_medida);
        formData.append('costo_compra', form.costo_compra);
        formData.append('id_proveedor', form.id_proveedor);
        if (form.imagen) {
            formData.append('imagen', form.imagen);
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (editando) {
                await axios.put(`${API_URL}/plantas/${editando}`, formData, config);
                alert('Planta actualizada');
            } else {
                await axios.post(`${API_URL}/plantas`, formData, config);
                alert('Planta creada');
            }

            setForm({
                nombre: '', descripcion: '', categoria: '',
                precio_base: '', precio_ciento: '', precio_docena: '',
                stock: 0, unidad_medida: 'Pieza',
                costo_compra: 0, imagen: null, id_proveedor: ''
            });
            setEditando(null);
            setShowForm(false);
            await cargarPlantas();

        } catch (error) {
            console.error("Error al guardar:", error);
            alert(error.response?.data?.error || 'Error al guardar planta');
        }
    };

    const eliminarPlanta = async (id, nombre) => {
        if (window.confirm(`Eliminar ${nombre}?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/plantas/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Planta eliminada');
                await cargarPlantas();
            } catch (error) {
                alert('Error al eliminar planta');
            }
        }
    };

    const editarPlanta = (planta) => {
        setForm({
            nombre: planta.nombre,
            descripcion: planta.descripcion || '',
            categoria: planta.categoria || '',
            precio_base: planta.precio_base,
            precio_ciento: planta.precio_ciento || '',
            precio_docena: planta.precio_docena || '',
            stock: planta.stock,
            unidad_medida: planta.unidad_medida || 'Pieza',
            costo_compra: planta.costo_compra || 0,
            imagen: null,
            id_proveedor: planta.id_proveedor || ''
        });
        setEditando(planta.id_planta);
        setShowForm(true);
    };

    const plantasFiltradas = plantas.filter(planta =>
        planta.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (planta.categoria && planta.categoria.toLowerCase().includes(search.toLowerCase()))
    );

    const plantasPorCategoria = {
        ornato: plantasFiltradas.filter(p => getCategoriaId(p.categoria) === 'ornato'),
        jardineria: plantasFiltradas.filter(p => getCategoriaId(p.categoria) === 'jardineria'),
        hierbas: plantasFiltradas.filter(p => getCategoriaId(p.categoria) === 'hierbas'),
        otras: plantasFiltradas.filter(p => getCategoriaId(p.categoria) === 'otras')
    };

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const isDueño = usuario.rol === 'Dueño';

    const totalPlantas = plantas.length;
    const stockBajo = plantas.filter(p => p.stock < 20).length;

    const SeccionCategoria = ({ titulo, icono: Icono, plantas: lista, colorBg }) => {
        if (lista.length === 0) return null;
        return (
            <div className="mb-10">
                <div className={`${colorBg} rounded-xl p-3 mb-4`}>
                    <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#1B4332' }}>
                        <Icono size={22} style={{ color: '#D97757' }} />
                        {titulo}
                        <span className="text-sm px-2 py-0.5 rounded-full ml-2" style={{ backgroundColor: '#CADBB7', color: '#1B4332' }}>
                            {lista.length}
                        </span>
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {lista.map((planta) => (
                        <div key={planta.id_planta} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
                            <div className="h-32 bg-gradient-to-br from-green-50 to-gray-50 flex items-center justify-center overflow-hidden">
                                {planta.imagen_url ? (
                                    <img src={planta.imagen_url} alt={planta.nombre} className="w-full h-full object-cover" />
                                ) : (
                                    <Leaf size={48} style={{ color: '#93A267' }} />
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-bold" style={{ color: '#1B4332' }}>{planta.nombre}</h3>
                                    {planta.stock < 20 && (
                                        <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: '#D97757', color: 'white' }}>
                                            <AlertCircle size={10} /> Stock bajo
                                        </span>
                                    )}
                                </div>

                                {/* Categoría */}
                                {planta.categoria && (
                                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#93A267' }}>
                                        {getIconoCategoria(planta.categoria)}
                                        {planta.categoria}
                                    </p>
                                )}

                                {/* PROVEEDOR - NUEVO */}
                                {planta.id_proveedor && planta.proveedor_nombre && (
                                    <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: '#93A267' }}>
                                        <Truck size={10} />
                                        <span>Proveedor: {planta.proveedor_nombre}</span>
                                    </div>
                                )}

                                {/* Descripción */}
                                {planta.descripcion && (
                                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{planta.descripcion}</p>
                                )}

                                {/* TRES PRECIOS - VERSIÓN MEJORADA */}
                                <div className="mt-3 space-y-2">
                                    {/* Precio por pieza */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={14} style={{ color: '#D97757' }} />
                                            <span className="text-sm font-medium" style={{ color: '#1B4332' }}>Por pieza:</span>
                                        </div>
                                        <p className="text-base font-bold" style={{ color: '#D97757' }}>
                                            ${Number(planta.precio_base).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Precio por ciento */}
                                    {planta.precio_ciento > 0 && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Box size={14} style={{ color: '#D97757' }} />
                                                <span className="text-sm font-medium" style={{ color: '#1B4332' }}>Por ciento (100 pzs):</span>
                                            </div>
                                            <p className="text-base font-bold" style={{ color: '#D97757' }}>
                                                ${Number(planta.precio_ciento).toLocaleString()}
                                            </p>
                                        </div>
                                    )}

                                    {/* Precio por docena */}
                                    {planta.precio_docena > 0 && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Package size={14} style={{ color: '#D97757' }} />
                                                <span className="text-sm font-medium" style={{ color: '#1B4332' }}>Por docena (12 pzs):</span>
                                            </div>
                                            <p className="text-base font-bold" style={{ color: '#D97757' }}>
                                                ${Number(planta.precio_docena).toLocaleString()}
                                            </p>
                                        </div>
                                    )}

                                    {/* Costo de compra (solo admin) */}
                                    {isDueño && planta.costo_compra > 0 && (
                                        <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: '#CADBB7' }}>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp size={12} style={{ color: '#93A267' }} />
                                                <span className="text-xs" style={{ color: '#1B4332' }}>Costo:</span>
                                            </div>
                                            <p className="text-xs" style={{ color: '#93A267' }}>
                                                ${Number(planta.costo_compra).toLocaleString()}
                                            </p>
                                        </div>
                                    )}

                                    {/* Stock */}
                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-2">
                                            <Package size={12} style={{ color: planta.stock < 20 ? '#D97757' : '#93A267' }} />
                                            <span className="text-xs" style={{ color: '#1B4332' }}>Stock:</span>
                                        </div>
                                        <p className={`text-xs font-medium ${planta.stock < 20 ? 'font-bold' : ''}`}
                                            style={{ color: planta.stock < 20 ? '#D97757' : '#93A267' }}>
                                            {planta.stock} unidades {planta.stock < 20 && '(⚠️ Stock bajo)'}
                                        </p>
                                    </div>
                                </div>

                                {/* Botones de acción (solo admin) */}
                                {isDueño && (
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => editarPlanta(planta)}
                                            className="flex-1 py-2 rounded-lg text-sm font-medium transition hover:opacity-80 flex items-center justify-center gap-1"
                                            style={{ backgroundColor: '#E8EFE0', color: '#1B4332' }}
                                        >
                                            <Edit2 size={14} /> Editar
                                        </button>
                                        <button
                                            onClick={() => eliminarPlanta(planta.id_planta, planta.nombre)}
                                            className="flex-1 py-2 rounded-lg text-sm font-medium transition hover:opacity-80 flex items-center justify-center gap-1 text-white"
                                            style={{ backgroundColor: '#D97757' }}
                                        >
                                            <Trash2 size={14} /> Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: '#485935' }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-80 flex items-center gap-1 text-white">
                                <Leaf size={16} /> Total de plantas
                            </p>
                            <p className="text-3xl font-bold mt-1 text-white">{totalPlantas}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#93A267' }}>
                            <Leaf size={24} style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: '#D97757' }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-80 flex items-center gap-1 text-white">
                                <AlertCircle size={16} /> Stock bajo
                            </p>
                            <p className="text-3xl font-bold mt-1 text-white">{stockBajo}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                            <Package size={24} style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Buscador y botón nueva planta */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                    <input
                        type="text"
                        placeholder="Buscar planta por nombre o categoría..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                        style={{ borderColor: '#CADBB7' }}
                    />
                </div>
                {isDueño && (
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditando(null);
                            setForm({
                                nombre: '', descripcion: '', categoria: '',
                                precio_base: '', precio_ciento: '', precio_docena: '',
                                stock: 0, unidad_medida: 'Pieza',
                                costo_compra: 0, imagen: null, id_proveedor: ''
                            });
                        }}
                        className="px-6 py-3 rounded-lg font-semibold transition hover:opacity-90 flex items-center justify-center gap-2 text-white"
                        style={{ backgroundColor: '#D97757' }}
                    >
                        {showForm ? <X size={18} /> : <Plus size={18} />}
                        {showForm ? 'Cancelar' : 'Nueva Planta'}
                    </button>
                )}
            </div>

            {/* Formulario */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-md mb-6 overflow-hidden">
                    <div className="p-5" style={{ backgroundColor: '#485935' }}>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                            {editando ? <Edit2 size={20} /> : <Plus size={20} />}
                            {editando ? 'Editar Planta' : 'Nueva Planta'}
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="relative">
                                <Leaf size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                                <input type="text" name="nombre" placeholder="Nombre *" value={form.nombre} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1" style={{ borderColor: '#CADBB7' }} required />
                            </div>
                            <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-1" style={{ borderColor: '#CADBB7' }}>
                                <option value="">Seleccionar categoría</option>
                                <option value="ornato">🌸 Ornato</option>
                                <option value="jardineria">🌳 Jardinería</option>
                                <option value="hierbas">🌱 Hierbas de olor</option>
                            </select>
                           
                            <div className="relative">
                                <Truck size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                                <select name="id_proveedor" value={form.id_proveedor} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1 appearance-none" style={{ borderColor: '#CADBB7' }}>
                                    <option value="">Seleccionar proveedor</option>
                                    {proveedores.map(prov => (
                                        <option key={prov.id_proveedor} value={prov.id_proveedor}>{prov.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative">
                                <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                                <input type="number" name="precio_base" placeholder="Precio por pieza *" value={form.precio_base} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1" style={{ borderColor: '#CADBB7' }} required step="0.01" />
                            </div>
                            <div className="relative">
                                <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                                <input type="number" name="precio_ciento" placeholder="Precio por ciento (100 pzs)" value={form.precio_ciento} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-lg border" style={{ borderColor: '#CADBB7' }} step="0.01" />
                            </div>
                            <div className="relative">
                                <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                                <input type="number" name="precio_docena" placeholder="Precio por docena (12 pzs)" value={form.precio_docena} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-lg border" style={{ borderColor: '#CADBB7' }} step="0.01" />
                            </div>
                            <div className="relative">
                                <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                                <input type="number" name="costo_compra" placeholder="Costo de compra" value={form.costo_compra} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-lg border" style={{ borderColor: '#CADBB7' }} step="0.01" />
                            </div>
                            <div className="relative">
                                <Package size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                                <input type="number" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-lg border" style={{ borderColor: '#CADBB7' }} />
                            </div>
                            <div className="relative md:col-span-2">
                                <Image size={18} className="absolute left-3 top-4" style={{ color: '#93A267' }} />
                                <input type="file" name="imagen" accept="image/*" onChange={(e) => setForm({ ...form, imagen: e.target.files[0] })} className="w-full pl-10 pr-4 py-3 rounded-lg border" style={{ borderColor: '#CADBB7' }} />
                            </div>
                            <div className="relative md:col-span-2">
                                <FileText size={18} className="absolute left-3 top-4" style={{ color: '#93A267' }} />
                                <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-lg border" style={{ borderColor: '#CADBB7' }} rows="3" />
                            </div>
                        </div>
                        <button type="submit" className="w-full mt-5 py-3 rounded-lg font-semibold transition hover:opacity-90 flex items-center justify-center gap-2 text-white" style={{ backgroundColor: '#D97757' }}>
                            <Save size={18} />
                            {editando ? 'Actualizar Planta' : 'Crear Planta'}
                        </button>
                    </form>
                </div>
            )}

            {/* Lista de plantas */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-pulse text-4xl mb-4">🌿</div>
                    <p style={{ color: '#93A267' }}>Cargando plantas...</p>
                </div>
            ) : plantasFiltradas.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                    <Leaf size={48} className="mx-auto mb-3" style={{ color: '#CADBB7' }} />
                    <p style={{ color: '#93A267' }}>No hay plantas registradas</p>
                </div>
            ) : (
                <>
                    <SeccionCategoria titulo="Ornato" icono={Flower2} plantas={plantasPorCategoria.ornato} colorBg="bg-pink-50" />
                    <SeccionCategoria titulo="Jardinería" icono={Trees} plantas={plantasPorCategoria.jardineria} colorBg="bg-blue-50" />
                    <SeccionCategoria titulo="Hierbas de olor" icono={Sprout} plantas={plantasPorCategoria.hierbas} colorBg="bg-green-50" />
                    <SeccionCategoria titulo="Otras categorías" icono={FolderOpen} plantas={plantasPorCategoria.otras} colorBg="bg-gray-50" />
                </>
            )}
        </div>
    );
}

export default Plantas;