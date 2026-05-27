import { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Phone, User, Plus, Edit2, Trash2, Search, X, Save } from 'lucide-react';
import { API_URL } from '../config';

function Proveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editando, setEditando] = useState(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({
        nombre: '',
        telefono: '',
        contacto: ''
    });

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const isDueño = usuario.rol === 'Dueño';

    useEffect(() => {
        if (isDueño) {
            cargarProveedores();
        }
    }, []);

    const cargarProveedores = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/proveedores`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProveedores(response.data);
        } catch (error) {
            console.error('Error cargando proveedores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
    if (!form.nombre.trim()) {
        alert('El nombre del proveedor es requerido');
        return;
    }
    
    if (form.telefono && !/^\d{10}$/.test(form.telefono) || form.telefono && !/^[\d\s-]+$/.test(form.telefono)) {
        alert('El teléfono debe tener 10 dígitos y solo puede contener números, espacios y guiones');
        return;
        
    }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            if (editando) {
                await axios.put(`${API_URL}/proveedores/${editando}`, form, config);
                alert('Proveedor actualizado');
            } else {
                await axios.post(`${API_URL}/proveedores`, form, config);
                alert('Proveedor creado');
            }
            
            setForm({ nombre: '', telefono: '', contacto: '' });
            setEditando(null);
            setShowForm(false);
            cargarProveedores();
        } catch (error) {
            alert(error.response?.data?.error || 'Error al guardar proveedor');
        }
    };

    const eliminarProveedor = async (id, nombre) => {
        if (window.confirm(`Eliminar proveedor "${nombre}"?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/proveedores/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Proveedor eliminado');
                cargarProveedores();
            } catch (error) {
                alert(error.response?.data?.error || 'Error al eliminar proveedor');
            }
        }
    };

    const editarProveedor = (proveedor) => {
        setForm({
            nombre: proveedor.nombre,
            telefono: proveedor.telefono || '',
            contacto: proveedor.contacto || ''
        });
        setEditando(proveedor.id_proveedor);
        setShowForm(true);
    };

    const proveedoresFiltrados = proveedores.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (p.contacto && p.contacto.toLowerCase().includes(search.toLowerCase()))
    );

    if (!isDueño) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">⛔</div>
                <h1 className="text-2xl font-bold mb-4" style={{ color: '#D97757' }}>Acceso Denegado</h1>
                <p style={{ color: '#93A267' }}>Solo el dueño puede gestionar proveedores.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Tarjeta de resumen */}
            <div className="rounded-xl p-5 shadow-md mb-6" style={{ backgroundColor: '#485935' }}>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm opacity-80 flex items-center gap-1 text-white">
                            <Truck size={16} /> Total de proveedores
                        </p>
                        <p className="text-3xl font-bold mt-1 text-white">{proveedores.length}</p>
                    </div>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#93A267' }}>
                        <Truck size={28} style={{ color: 'white' }} />
                    </div>
                </div>
            </div>

            {/* Botón nuevo proveedor */}
            <button
                onClick={() => { setShowForm(!showForm); setEditando(null); setForm({ nombre: '', telefono: '', contacto: '' }); }}
                className="mb-6 px-6 py-3 rounded-lg font-semibold transition hover:opacity-90 flex items-center gap-2 text-white"
                style={{ backgroundColor: '#D97757' }}
            >
                {showForm ? <X size={18} /> : <Plus size={18} />}
                {showForm ? 'Cancelar' : 'Nuevo Proveedor'}
            </button>

            {/* Formulario */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-md mb-6 overflow-hidden">
                    <div className="p-5" style={{ backgroundColor: '#485935' }}>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                            {editando ? <Edit2 size={20} /> : <Plus size={20} />}
                            {editando ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="relative">
                                <Truck size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                                <input
                                    type="text"
                                    name="nombre"
                                    placeholder="Nombre del proveedor *"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                                    style={{ borderColor: '#CADBB7' }}
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                                <input
                                    type="text"
                                    name="telefono"
                                    placeholder="Teléfono"
                                    value={form.telefono}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                                    style={{ borderColor: '#CADBB7' }}
                                />
                            </div>
                            <div className="relative md:col-span-2">
                                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                                <input
                                    type="text"
                                    name="contacto"
                                    placeholder="Persona de contacto"
                                    value={form.contacto}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                                    style={{ borderColor: '#CADBB7' }}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full mt-5 py-3 rounded-lg font-semibold transition hover:opacity-90 flex items-center justify-center gap-2 text-white"
                            style={{ backgroundColor: '#D97757' }}
                        >
                            <Save size={18} />
                            {editando ? 'Actualizar Proveedor' : 'Crear Proveedor'}
                        </button>
                    </form>
                </div>
            )}

            {/* Buscador */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                    <input
                        type="text"
                        placeholder="Buscar proveedor por nombre o contacto..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                        style={{ borderColor: '#CADBB7' }}
                    />
                </div>
            </div>

            {/* Lista de proveedores */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-pulse text-4xl mb-4">🚚</div>
                    <p style={{ color: '#93A267' }}>Cargando proveedores...</p>
                </div>
            ) : proveedoresFiltrados.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                    <Truck size={48} className="mx-auto mb-3" style={{ color: '#CADBB7' }} />
                    <p style={{ color: '#93A267' }}>No hay proveedores registrados</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {proveedoresFiltrados.map((proveedor) => (
                        <div key={proveedor.id_proveedor} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
                            <div className="p-5" style={{ backgroundColor: '#485935' }}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{proveedor.nombre}</h3>
                                        {proveedor.contacto && (
                                            <p className="text-sm mt-1" style={{ color: '#CADBB7' }}>
                                                <User size={12} className="inline mr-1" /> {proveedor.contacto}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#93A267' }}>
                                        <Truck size={18} style={{ color: 'white' }} />
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 space-y-2">
                                {proveedor.telefono && (
                                    <p className="flex items-center gap-2 text-sm" style={{ color: '#1B4332' }}>
                                        <Phone size={14} style={{ color: '#93A267' }} /> {proveedor.telefono}
                                    </p>
                                )}
                                <div className="flex gap-2 mt-4 pt-2 border-t" style={{ borderColor: '#CADBB7' }}>
                                    <button
                                        onClick={() => editarProveedor(proveedor)}
                                        className="flex-1 py-2 rounded-lg text-sm font-medium transition hover:opacity-80 flex items-center justify-center gap-1"
                                        style={{ backgroundColor: '#E8EFE0', color: '#1B4332' }}
                                    >
                                        <Edit2 size={14} /> Editar
                                    </button>
                                    <button
                                        onClick={() => eliminarProveedor(proveedor.id_proveedor, proveedor.nombre)}
                                        className="flex-1 py-2 rounded-lg text-sm font-medium transition hover:opacity-80 flex items-center justify-center gap-1 text-white"
                                        style={{ backgroundColor: '#D97757' }}
                                    >
                                        <Trash2 size={14} /> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Proveedores;