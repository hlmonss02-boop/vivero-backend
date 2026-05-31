import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import axios from 'axios';
import {
    Leaf, Search, LogIn, Flower2, Trees, Sprout,
    Package, Phone, MapPin, Grid3x3, Tag, DollarSign, Box, FolderOpen
} from 'lucide-react';

function CatalogoPublico() {
    const [plantas, setPlantas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');

    const categorias = [
        { id: 'todas', nombre: 'Todas', icono: <Grid3x3 size={16} /> },
        { id: 'ornato', nombre: 'Ornato', icono: <Flower2 size={16} /> },
        { id: 'jardineria', nombre: 'Jardinería', icono: <Trees size={16} /> },
        { id: 'hierbas', nombre: 'Hierbas', icono: <Sprout size={16} /> }
    ];

    // Función para obtener icono según categoría (igual que en Plantas.jsx)
    const getIconoCategoria = (categoria) => {
        if (!categoria) return <FolderOpen size={12} />;
        const cat = categoria.toLowerCase();
        if (cat === 'ornato' || cat.includes('ornato')) return <Flower2 size={12} />;
        if (cat === 'jardineria' || cat === 'jardinería' || cat.includes('jardin')) return <Trees size={12} />;
        if (cat === 'hierbas' || cat === 'hierbas de olor' || cat.includes('hierba')) return <Sprout size={12} />;
        return <FolderOpen size={12} />;
    };

    useEffect(() => {
        cargarPlantas();
    }, []);

    const cargarPlantas = async () => {
        try {
            const response = await axios.get(`${API_URL}/plantas`);
            const plantasOrdenadas = response.data.sort((a, b) =>
                a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
            );
            setPlantas(plantasOrdenadas);
        } catch (error) {
            console.error('Error cargando plantas:', error);
        } finally {
            setLoading(false);
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

    const plantasFiltradas = plantas.filter(planta => {
        const matchSearch = planta.nombre.toLowerCase().includes(search.toLowerCase());
        if (categoriaSeleccionada === 'todas') return matchSearch;
        return matchSearch && getCategoriaId(planta.categoria) === categoriaSeleccionada;
    });

    const plantasPorCategoria = {
        ornato: plantasFiltradas.filter(p => getCategoriaId(p.categoria) === 'ornato'),
        jardineria: plantasFiltradas.filter(p => getCategoriaId(p.categoria) === 'jardineria'),
        hierbas: plantasFiltradas.filter(p => getCategoriaId(p.categoria) === 'hierbas'),
        otras: plantasFiltradas.filter(p => getCategoriaId(p.categoria) === 'otras')
    };

    const SeccionCategoria = ({ titulo, icono: Icono, plantas: lista, colorBg }) => {
        if (lista.length === 0) return null;
        return (
            <div className="mb-12">
                <div className={`${colorBg} rounded-xl p-3 mb-4`}>
                    <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#1B4332' }}>
                        <Icono size={22} style={{ color: '#D97757' }} />
                        {titulo}
                        <span className="text-sm px-2 py-1 rounded-full ml-2" style={{ backgroundColor: '#CADBB7', color: '#1B4332' }}>
                            {lista.length}
                        </span>
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {lista.map((planta) => (
                        <div key={planta.id_planta} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition hover:-translate-y-1 duration-300">
                            <div className="h-36 bg-gradient-to-br from-green-50 to-gray-50 flex items-center justify-center overflow-hidden">
                                {planta.imagen_url ? (
                                    <img
                                        src={planta.imagen_url}
                                        alt={planta.nombre}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Leaf size={48} style={{ color: '#93A267' }} />
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-xl font-bold" style={{ color: '#1B4332' }}>{planta.nombre}</h3>
                                </div>

                                {/* Categoría con icono diferente según el tipo */}
                                {planta.categoria && (
                                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#93A267' }}>
                                        {getIconoCategoria(planta.categoria)}
                                        {planta.categoria}
                                    </p>
                                )}

                                {/* Descripción */}
                                {planta.descripcion && (
                                    <p className="text-sm mt-1 line-clamp-2" style={{ color: '#93A267' }}>{planta.descripcion}</p>
                                )}

                                {/* Tres precios */}
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={14} style={{ color: '#D97757' }} />
                                            <span className="text-sm font-medium" style={{ color: '#1B4332' }}>Por pieza:</span>
                                        </div>
                                        <p className="text-base font-bold" style={{ color: '#D97757' }}>
                                            ${Number(planta.precio_base).toLocaleString()}
                                        </p>
                                    </div>

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
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F8FAF9' }}>
            {/* Header */}
            <header className="sticky top-0 z-10 shadow-lg" style={{ backgroundColor: '#485935' }}>
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#93A267' }}>
                                <Leaf size={20} style={{ color: 'white' }} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Vivero Juanito</h1>
                                <p className="text-xs" style={{ color: '#CADBB7' }}>Plantas de ornato, jardinería y hierbas</p>
                            </div>
                        </div>
                        <Link
                            to="/login"
                            className="px-5 py-2 rounded-full font-semibold shadow-lg hover:scale-105 transition flex items-center gap-2"
                            style={{ backgroundColor: '#D97757', color: 'white' }}
                        >
                            <LogIn size={16} /> Iniciar Sesión
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <div className="py-12 text-center" style={{ backgroundColor: '#93A267' }}>
                <div className="container mx-auto px-4">
                    <Leaf size={48} className="mx-auto mb-3" style={{ color: 'white', opacity: 0.8 }} />
                    <h2 className="text-3xl font-bold text-white">Nuestro Catálogo</h2>
                    <p className="mt-2" style={{ color: '#CADBB7' }}>Descubre nuestra variedad de plantas para tu hogar y jardín</p>
                </div>
            </div>

            {/* Contenido principal */}
            <main className="container mx-auto px-4 py-8">
                {/* Buscador y filtros */}
                <div className="bg-white rounded-2xl shadow-md p-5 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                            <input
                                type="text"
                                placeholder="Buscar planta por nombre..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-1"
                                style={{ borderColor: '#CADBB7' }}
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {categorias.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategoriaSeleccionada(cat.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${categoriaSeleccionada === cat.id
                                            ? 'text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    style={categoriaSeleccionada === cat.id ? { backgroundColor: '#D97757' } : {}}
                                >
                                    {cat.icono} {cat.nombre}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Resultados */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-pulse">
                            <Leaf size={48} className="mx-auto mb-4" style={{ color: '#CADBB7' }} />
                        </div>
                        <p style={{ color: '#93A267' }}>Cargando plantas...</p>
                    </div>
                ) : plantasFiltradas.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                        <Package size={48} className="mx-auto mb-3" style={{ color: '#CADBB7' }} />
                        <p className="text-lg" style={{ color: '#93A267' }}>No hay plantas disponibles</p>
                        <p className="text-sm mt-2" style={{ color: '#CADBB7' }}>Pronto tendremos más productos</p>
                    </div>
                ) : (
                    <>
                        <SeccionCategoria titulo="Ornato" icono={Flower2} plantas={plantasPorCategoria.ornato} colorBg="bg-pink-50" />
                        <SeccionCategoria titulo="Jardinería" icono={Trees} plantas={plantasPorCategoria.jardineria} colorBg="bg-blue-50" />
                        <SeccionCategoria titulo="Hierbas de olor" icono={Sprout} plantas={plantasPorCategoria.hierbas} colorBg="bg-green-50" />
                        <SeccionCategoria titulo="Otras categorías" icono={Package} plantas={plantasPorCategoria.otras} colorBg="bg-gray-50" />
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-12 py-8 text-center" style={{ backgroundColor: '#485935' }}>
                <div className="container mx-auto px-4">
                    <Leaf size={24} className="mx-auto mb-3" style={{ color: '#CADBB7' }} />
                    <p className="text-lg font-semibold text-white">Vivero Juanito</p>
                    <p className="text-sm mt-1 flex items-center justify-center gap-1" style={{ color: '#CADBB7' }}>
                        <MapPin size={14} /> San Lorenzo Tlacotepec
                    </p>
                    <p className="text-sm mt-2 flex items-center justify-center gap-1" style={{ color: '#CADBB7' }}>
                        <Phone size={14} /> WhatsApp: 712 314 3713 - 712 262 9486
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default CatalogoPublico;