import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    AlertTriangle, 
    Package, 
    DollarSign, 
    Plus, 
    X, 
    Calendar, 
    User,
    Save,
    Trash2,
    Edit2,
    Eye
} from 'lucide-react';
import { API_URL } from '../config';

function Mermas() {
    const [plantas, setPlantas] = useState([]);
    const [mermas, setMermas] = useState([]);
    const [resumen, setResumen] = useState({ total_mermas: 0, total_unidades_perdidas: 0, valor_perdido: 0 });
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editando, setEditando] = useState(null);
    const [form, setForm] = useState({
        id_planta: '',
        cantidad: '',
        motivo: ''
    });
    const [otroMotivo, setOtroMotivo] = useState('');

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const isDueño = usuario.rol === 'Dueño';

    useEffect(() => {
        cargarDatos();
        cargarPlantas();
    }, []);

    const cargarDatos = async () => {
        try {
            const token = localStorage.getItem('token');
            const [mermasRes, resumenRes] = await Promise.all([
                axios.get(`${API_URL}/mermas`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_URL}/mermas/resumen`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setMermas(mermasRes.data);
            setResumen(resumenRes.data);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarPlantas = async () => {
        try {
            const response = await axios.get(`${API_URL}/plantas`);
            setPlantas(response.data);
        } catch (error) {
            console.error('Error cargando plantas:', error);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let motivoFinal = form.motivo;
        if (form.motivo === 'otro') {
            if (!otroMotivo.trim()) {
                alert('Por favor escriba el motivo');
                return;
            }
            motivoFinal = otroMotivo;
        }
        
        const data = {
            id_planta: form.id_planta,
            cantidad: form.cantidad,
            motivo: motivoFinal
        };
        
        try {
            const token = localStorage.getItem('token');
            
            if (editando) {
                await axios.put(`${API_URL}/mermas/${editando}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Merma actualizada correctamente');
            } else {
                await axios.post(`${API_URL}/mermas`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Merma registrada correctamente');
            }
            
            setForm({ id_planta: '', cantidad: '', motivo: '' });
            setOtroMotivo('');
            setEditando(null);
            setShowForm(false);
            cargarDatos();
            cargarPlantas();
        } catch (error) {
            alert(error.response?.data?.error || 'Error al guardar merma');
        }
    };

    const eliminarMerma = async (id, planta_nombre) => {
        if (window.confirm(`¿Eliminar merma de ${planta_nombre}?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/mermas/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Merma eliminada');
                cargarDatos();
                cargarPlantas();
            } catch (error) {
                alert('Error al eliminar merma');
            }
        }
    };

    const editarMerma = (merma) => {
        setForm({
            id_planta: merma.id_planta,
            cantidad: merma.cantidad,
            motivo: merma.motivo
        });
        setOtroMotivo(merma.motivo);
        setEditando(merma.id_merma);
        setShowForm(true);
    };

    if (!isDueño) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">⛔</div>
                <h1 className="text-2xl font-bold mb-4" style={{ color: '#D97757' }}>Acceso Denegado</h1>
                <p style={{ color: '#93A267' }}>Solo el dueño puede gestionar mermas.</p>
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
                                <AlertTriangle size={16} /> Total de mermas
                            </p>
                            <p className="text-3xl font-bold mt-1 text-white">{resumen.total_mermas || 0}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#93A267' }}>
                            <AlertTriangle size={24} style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: '#D97757' }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-80 flex items-center gap-1 text-white">
                                <Package size={16} /> Unidades perdidas
                            </p>
                            <p className="text-3xl font-bold mt-1 text-white">{resumen.total_unidades_perdidas || 0}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                            <Package size={24} style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: '#93A267' }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-80 flex items-center gap-1 text-white">
                                <DollarSign size={16} /> Valor perdido
                            </p>
                            <p className="text-3xl font-bold mt-1 text-white">${parseFloat(resumen.valor_perdido || 0).toFixed(2)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                            <DollarSign size={24} style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Botón nueva merma */}
            <button
                onClick={() => { setShowForm(!showForm); setEditando(null); setForm({ id_planta: '', cantidad: '', motivo: '' }); setOtroMotivo(''); }}
                className="mb-6 px-6 py-3 rounded-lg font-semibold transition hover:opacity-90 flex items-center gap-2 text-white"
                style={{ backgroundColor: '#D97757' }}
            >
                {showForm ? <X size={18} /> : <Plus size={18} />}
                {showForm ? 'Cancelar' : 'Registrar Merma'}
            </button>

            {/* Formulario */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-md mb-6 overflow-hidden">
                    <div className="p-5" style={{ backgroundColor: '#485935' }}>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                            <AlertTriangle size={20} />
                            {editando ? 'Editar Merma' : 'Nueva Merma'}
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="relative md:col-span-2">
                                <select
                                    name="id_planta"
                                    value={form.id_planta}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-1 appearance-none"
                                    style={{ borderColor: '#CADBB7' }}
                                    required
                                >
                                    <option value="">Selecciona una planta</option>
                                    {plantas.map(planta => (
                                        <option key={planta.id_planta} value={planta.id_planta}>
                                            {planta.nombre} (Stock: {planta.stock})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative">
                                <Package size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                                <input
                                    type="number"
                                    name="cantidad"
                                    placeholder="Cantidad perdida"
                                    value={form.cantidad}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                                    style={{ borderColor: '#CADBB7' }}
                                    required
                                    min="1"
                                />
                            </div>
                            <div className="relative md:col-span-2">
                                <select
                                    name="motivo"
                                    value={form.motivo}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-1 appearance-none"
                                    style={{ borderColor: '#CADBB7' }}
                                    required
                                >
                                    <option value="">Motivo de la pérdida</option>
                                    <option value="Enfermedad">Enfermedad</option>
                                    <option value="Plagas">Plagas</option>
                                    <option value="Secado">Secado</option>
                                    <option value="Daño físico">Daño físico</option>
                                    <option value="Cliente devolvió">Cliente devolvió en mal estado</option>
                                    <option value="otro">Otro (escribir)</option>
                                </select>
                            </div>
                            {form.motivo === 'otro' && (
                                <div className="relative md:col-span-2">
                                    <input
                                        type="text"
                                        placeholder="Escriba el motivo"
                                        value={otroMotivo}
                                        onChange={(e) => setOtroMotivo(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-1"
                                        style={{ borderColor: '#CADBB7' }}
                                        required
                                    />
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="w-full mt-5 py-3 rounded-lg font-semibold transition hover:opacity-90 flex items-center justify-center gap-2 text-white"
                            style={{ backgroundColor: '#D97757' }}
                        >
                            <Save size={18} />
                            {editando ? 'Actualizar Merma' : 'Registrar Merma'}
                        </button>
                    </form>
                </div>
            )}

            {/* Lista de mermas */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="p-5" style={{ backgroundColor: '#485935' }}>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <AlertTriangle size={20} /> Historial de Mermas
                    </h2>
                </div>
                <div className="p-5">
                    {loading ? (
                        <div className="text-center py-10">
                            <div className="animate-pulse text-4xl mb-4">⚠️</div>
                            <p style={{ color: '#93A267' }}>Cargando mermas...</p>
                        </div>
                    ) : mermas.length === 0 ? (
                        <div className="text-center py-10">
                            <AlertTriangle size={48} className="mx-auto mb-3" style={{ color: '#CADBB7' }} />
                            <p style={{ color: '#93A267' }}>No hay mermas registradas</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b" style={{ borderColor: '#CADBB7' }}>
                                        <th className="p-3 text-left" style={{ color: '#1B4332' }}>Fecha</th>
                                        <th className="p-3 text-left" style={{ color: '#1B4332' }}>Planta</th>
                                        <th className="p-3 text-center" style={{ color: '#1B4332' }}>Cantidad</th>
                                        <th className="p-3 text-left" style={{ color: '#1B4332' }}>Motivo</th>
                                        <th className="p-3 text-left" style={{ color: '#1B4332' }}>Registrado por</th>
                                        <th className="p-3 text-center" style={{ color: '#1B4332' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mermas.map((merma) => (
                                        <tr key={merma.id_merma} className="border-b" style={{ borderColor: '#CADBB7' }}>
                                            <td className="p-3 text-sm" style={{ color: '#93A267' }}>
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={12} /> {new Date(merma.fecha_registro).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-3 font-medium" style={{ color: '#1B4332' }}>{merma.planta_nombre}</td>
                                            <td className="p-3 text-center font-bold" style={{ color: '#D97757' }}>{merma.cantidad}</td>
                                            <td className="p-3 text-sm" style={{ color: '#93A267' }}>{merma.motivo}</td>
                                            <td className="p-3 text-sm flex items-center gap-1" style={{ color: '#93A267' }}>
                                                <User size={12} /> {merma.registrado_por_nombre}
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <button onClick={() => editarMerma(merma)} className="p-1 rounded hover:bg-blue-50" style={{ color: '#D97757' }}>
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => eliminarMerma(merma.id_merma, merma.planta_nombre)} className="p-1 rounded hover:bg-red-50" style={{ color: '#D97757' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Mermas;