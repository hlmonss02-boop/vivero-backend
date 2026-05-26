import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Mail, Phone, Lock, Trash2, Shield, UserCheck, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../config';

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [form, setForm] = useState({
        nombre: '',
        correo: '',
        telefono: '',
        password: '',
        rol: 'Vendedor'
    });
    const [loading, setLoading] = useState(false);
    const [mostrarPassword, setMostrarPassword] = useState({});

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/usuarios`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsuarios(response.data);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/auth/register`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Vendedor creado exitosamente');
            setForm({ nombre: '', correo: '', telefono: '', password: '', rol: 'Vendedor' });
            cargarUsuarios();
        } catch (error) {
            alert(error.response?.data?.error || 'Error al crear vendedor');
        } finally {
            setLoading(false);
        }
    };

    const eliminarUsuario = async (id, nombre) => {
        const confirmar = window.confirm(`Eliminar a ${nombre}? Esta acción no se puede deshacer.`);
        if (!confirmar) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/usuarios/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Usuario ${nombre} eliminado`);
            cargarUsuarios();
        } catch (error) {
            alert(error.response?.data?.error || 'Error al eliminar usuario');
        }
    };

    // Función para mostrar/ocultar contraseña
    const togglePassword = (userId) => {
        setMostrarPassword(prev => ({ ...prev, [userId]: !prev[userId] }));
    };

    const usuarioActual = JSON.parse(localStorage.getItem('usuario') || '{}');
    const isDueño = usuarioActual.rol === 'Dueño';

    const vendedoresCount = usuarios.filter(u => u.rol === 'Vendedor').length;

    if (!isDueño) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">⛔</div>
                <h1 className="text-2xl font-bold mb-4" style={{ color: '#D97757' }}>Acceso Denegado</h1>
                <p style={{ color: '#93A267' }}>Solo el dueño puede gestionar usuarios.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: '#CADBB7' }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-70 flex items-center gap-1" style={{ color: '#1B4332' }}>
                                <Users size={16} /> Total de usuarios
                            </p>
                            <p className="text-3xl font-bold mt-1" style={{ color: '#1B4332' }}>{usuarios.length}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#93A267' }}>
                            <Users size={24} style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: '#E8EFE0' }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-70 flex items-center gap-1" style={{ color: '#1B4332' }}>
                                <UserCheck size={16} /> Vendedores activos
                            </p>
                            <p className="text-3xl font-bold mt-1" style={{ color: '#1B4332' }}>{vendedoresCount}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#93A267' }}>
                            <UserCheck size={24} style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulario para crear vendedor */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="p-5" style={{ backgroundColor: '#485935' }}>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                            <UserPlus size={20} /> Nuevo Vendedor
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="relative">
                            <Users size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                            <input
                                type="text"
                                name="nombre"
                                placeholder="Nombre completo"
                                value={form.nombre}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                                style={{ borderColor: '#CADBB7' }}
                                required
                            />
                        </div>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                            <input
                                type="email"
                                name="correo"
                                placeholder="Correo electrónico"
                                value={form.correo}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                                style={{ borderColor: '#CADBB7' }}
                                required
                            />
                        </div>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                            <input
                                type="tel"
                                name="telefono"
                                placeholder="Teléfono"
                                value={form.telefono}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                                style={{ borderColor: '#CADBB7' }}
                            />
                        </div>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                            <input
                                type="password"
                                name="password"
                                placeholder="Contraseña"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                                style={{ borderColor: '#CADBB7' }}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg font-semibold transition hover:opacity-90 disabled:opacity-50 text-white"
                            style={{ backgroundColor: '#D97757' }}
                        >
                            {loading ? 'Creando...' : 'Crear Vendedor'}
                        </button>
                    </form>
                </div>

                {/* Lista de vendedores */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="p-5" style={{ backgroundColor: '#485935' }}>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                            <Users size={20} /> Lista de Usuarios
                        </h2>
                    </div>
                    <div className="p-6">
                        {usuarios.length === 0 ? (
                            <div className="text-center py-10">
                                <Users size={48} className="mx-auto mb-3" style={{ color: '#CADBB7' }} />
                                <p style={{ color: '#93A267' }}>No hay usuarios registrados</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {usuarios.map((user) => (
                                    <div key={user.id_usuario} className="flex justify-between items-center p-3 rounded-lg border" style={{ borderColor: '#CADBB7' }}>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-bold" style={{ color: '#1B4332' }}>{user.nombre}</p>
                                                {user.rol === 'Dueño' && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#CADBB7', color: '#1B4332' }}>
                                                        <Shield size={10} className="inline mr-1" /> Dueño
                                                    </span>
                                                )}
                                                {user.rol === 'Vendedor' && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E8EFE0', color: '#1B4332' }}>
                                                        Vendedor
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm" style={{ color: '#93A267' }}>{user.correo}</p>
                                            {user.telefono && (
                                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                    <Phone size={10} /> {user.telefono}
                                                </p>
                                            )}
                                            {/* Contraseña visible con botón mostrar/ocultar */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <Lock size={12} style={{ color: '#93A267' }} />
                                                <span className="text-xs font-mono">
                                                    {mostrarPassword[user.id_usuario] ? user.password : '••••••'}
                                                </span>
                                                <button
                                                    onClick={() => togglePassword(user.id_usuario)}
                                                    className="text-blue-500 hover:text-blue-700 transition"
                                                >
                                                    {mostrarPassword[user.id_usuario] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {usuarioActual.id_usuario !== user.id_usuario && (
                                            <button
                                                onClick={() => eliminarUsuario(user.id_usuario, user.nombre)}
                                                className="p-2 rounded-lg transition hover:bg-red-50"
                                                style={{ color: '#D97757' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                        
                                        {user.id_usuario === usuarioActual.id_usuario && (
                                            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#CADBB7', color: '#1B4332' }}>
                                                Tú
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Usuarios;