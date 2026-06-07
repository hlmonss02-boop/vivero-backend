import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    TrendingUp, DollarSign, PiggyBank, Percent, 
    Leaf, Flower2, Trees, Sprout, Award, 
    ChevronDown, ChevronUp, Search
} from 'lucide-react';
import { API_URL } from '../config';

function ReporteGanancias() {
    const [todasLasPlantas, setTodasLasPlantas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoriasAbiertas, setCategoriasAbiertas] = useState({});
    const [listaCategorias, setListaCategorias] = useState([]);
    const [porcentajes, setPorcentajes] = useState({ ahorro: 20, comision: 30 });
    const [resumen, setResumen] = useState({
        total_ventas: 0,
        total_ahorro: 0,
        total_comision: 0,
        total_ganancia: 0,
        plantas_con_ventas: 0
    });

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const isDueño = usuario.rol === 'Dueño';

    const getIconoCategoria = (categoria) => {
        const cat = (categoria || '').toLowerCase();
        if (cat === 'ornato') return <Flower2 size={16} style={{ color: '#D97757' }} />;
        if (cat === 'jardineria' || cat === 'jardinería') return <Trees size={16} style={{ color: '#D97757' }} />;
        if (cat === 'hierbas') return <Sprout size={16} style={{ color: '#D97757' }} />;
        return <Leaf size={16} style={{ color: '#D97757' }} />;
    };

    const getNombreCategoria = (categoria) => {
        const cat = (categoria || '').toLowerCase();
        if (cat === 'ornato') return 'Ornato';
        if (cat === 'jardineria' || cat === 'jardinería') return 'Jardinería';
        if (cat === 'hierbas') return 'Hierbas';
        return categoria || 'Otras';
    };

    const toggleCategoria = (categoria) => {
        setCategoriasAbiertas({
            ...categoriasAbiertas,
            [categoria]: !categoriasAbiertas[categoria]
        });
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // 🔥 OBTENER PORCENTAJE ACTUAL DE AHORRO
            const configRes = await axios.get(`${API_URL}/ahorros/porcentaje`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const porcentajeAhorroActual = configRes.data.porcentaje || 20;
            const porcentajeComision = 30; // Fijo según la señora
            
            setPorcentajes({ ahorro: porcentajeAhorroActual, comision: porcentajeComision });
            
            // Obtener plantas
            const plantasRes = await axios.get(`${API_URL}/plantas`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Obtener ventas
            const ventasRes = await axios.get(`${API_URL}/ventas/mis-ventas`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const gananciasPorPlanta = {};
            let totalVentas = 0;
            
            for (const venta of ventasRes.data) {
                const detallesRes = await axios.get(`${API_URL}/ventas/detalle/${venta.id_venta}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const montoVenta = parseFloat(venta.total_pagado);
                totalVentas += montoVenta;
                
                for (const detalle of detallesRes.data.detalles) {
                    const plantaId = detalle.id_planta;
                    if (!gananciasPorPlanta[plantaId]) {
                        gananciasPorPlanta[plantaId] = {
                            cantidad: 0,
                            total_vendido: 0
                        };
                    }
                    gananciasPorPlanta[plantaId].cantidad += detalle.cantidad;
                    gananciasPorPlanta[plantaId].total_vendido += parseFloat(detalle.subtotal);
                }
            }
            
            // 🔥 CALCULAR TOTALES CON PORCENTAJES REALES
            const totalAhorro = totalVentas * (porcentajeAhorroActual / 100);
            const totalComision = totalVentas * (porcentajeComision / 100);
            const totalGanancia = totalVentas - totalComision - totalAhorro;
            
            setResumen({
                total_ventas: totalVentas,
                total_ahorro: totalAhorro,
                total_comision: totalComision,
                total_ganancia: totalGanancia,
                plantas_con_ventas: Object.keys(gananciasPorPlanta).length
            });
            
            // 🔥 PROCESAR CADA PLANTA CON LOS PORCENTAJES REALES
            const plantasProcesadas = plantasRes.data.map(planta => {
                const gananciaData = gananciasPorPlanta[planta.id_planta] || { cantidad: 0, total_vendido: 0 };
                const totalVendido = gananciaData.total_vendido;
                const cantidad = gananciaData.cantidad;
                
                const costoPlanta = (planta.costo_compra || 0) * cantidad;
                const comisionPlanta = totalVendido * (porcentajeComision / 100);
                const ahorroPlanta = totalVendido * (porcentajeAhorroActual / 100);
                const gananciaReal = totalVendido - costoPlanta - comisionPlanta - ahorroPlanta;
                
                return {
                    id: planta.id_planta,
                    nombre: planta.nombre || 'Sin nombre',
                    categoria: planta.categoria || 'Otras',
                    cantidad_vendida: cantidad,
                    total_vendido: totalVendido,
                    ganancia: gananciaReal,
                    tiene_ventas: cantidad > 0
                };
            });
            
            plantasProcesadas.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
            setTodasLasPlantas(plantasProcesadas);
            
            const categorias = [...new Set(plantasProcesadas.map(p => p.categoria))];
            setListaCategorias(categorias);
            
            const inicialAbiertas = {};
            categorias.forEach(cat => { inicialAbiertas[cat] = true; });
            setCategoriasAbiertas(inicialAbiertas);
            
        } catch (err) {
            console.error('Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const plantasFiltradas = todasLasPlantas.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPorCategoria = {};
    listaCategorias.forEach(cat => {
        totalPorCategoria[cat] = plantasFiltradas
            .filter(p => p.categoria === cat)
            .reduce((sum, p) => sum + p.ganancia, 0);
    });

    const topTres = [...todasLasPlantas]
        .filter(p => p.tiene_ventas)
        .sort((a, b) => b.ganancia - a.ganancia)
        .slice(0, 3);

    const TarjetaPlanta = ({ planta }) => (
        <div className="bg-white rounded-xl p-3 mb-2 shadow-sm border" style={{ borderColor: '#CADBB7' }}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {getIconoCategoria(planta.categoria)}
                    <span className="font-bold text-sm" style={{ color: '#1B4332' }}>{planta.nombre}</span>
                    {!planta.tiene_ventas && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#CADBB7', color: '#1B4332' }}>
                            Sin ventas
                        </span>
                    )}
                    {planta.tiene_ventas && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E8EFE0', color: '#93A267' }}>
                            {planta.cantidad_vendida} uds
                        </span>
                    )}
                </div>
                <span className="text-sm font-bold" style={{ color: '#D97757' }}>
                    ${planta.ganancia.toFixed(2)}
                </span>
            </div>
        </div>
    );

    const SeccionCategoria = ({ categoria }) => {
        const plantas = plantasFiltradas.filter(p => p.categoria === categoria);
        if (plantas.length === 0) return null;
        
        return (
            <div className="mb-4">
                <button
                    onClick={() => toggleCategoria(categoria)}
                    className="w-full flex items-center justify-between p-3 rounded-xl"
                    style={{ backgroundColor: '#F8FAF9' }}
                >
                    <div className="flex items-center gap-2">
                        {getIconoCategoria(categoria)}
                        <span className="font-bold text-sm" style={{ color: '#1B4332' }}>{getNombreCategoria(categoria)}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#CADBB7', color: '#1B4332' }}>
                            {plantas.length}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: '#D97757' }}>${totalPorCategoria[categoria].toFixed(2)}</span>
                        {categoriasAbiertas[categoria] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                </button>
                {categoriasAbiertas[categoria] && (
                    <div className="mt-2 pl-1">
                        {plantas.map(planta => (
                            <TarjetaPlanta key={planta.id} planta={planta} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (!isDueño) {
        return (
            <div className="text-center py-20">
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full" style={{ backgroundColor: '#FCE4E4' }}>
                    <Leaf size={24} style={{ color: '#D97757' }} />
                </div>
                <p className="text-lg font-bold" style={{ color: '#D97757' }}>Acceso Denegado</p>
                <p className="text-sm" style={{ color: '#93A267' }}>Solo el dueño puede ver este reporte</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="animate-spin w-8 h-8 border-4 rounded-full mx-auto mb-3" style={{ borderColor: '#D97757', borderTopColor: 'transparent' }}></div>
                <p style={{ color: '#93A267' }}>Cargando {todasLasPlantas.length} plantas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <p style={{ color: '#D97757' }}>Error: {error}</p>
                <button onClick={cargarDatos} className="mt-3 px-4 py-2 rounded-lg text-white" style={{ backgroundColor: '#D97757' }}>
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-4">
            {/* Encabezado */}
            <div className="rounded-xl p-4 text-white" style={{ background: 'linear-gradient(135deg, #485935 0%, #1B4332 100%)' }}>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp size={20} /> Reporte de Ganancias
                        </h1>
                        <p className="text-xs opacity-80 mt-1">
                            Comisión: {porcentajes.comision}% | Ahorro: {porcentajes.ahorro}%
                        </p>
                    </div>
                    <div className="bg-white/20 rounded-full px-3 py-1 text-xs">
                        {todasLasPlantas.length} plantas | {resumen.plantas_con_ventas} con ventas
                    </div>
                </div>
            </div>

            {/* Top 3 plantas más rentables */}
            {topTres.length > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-sm border" style={{ borderColor: '#CADBB7' }}>
                    <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#1B4332' }}>
                        <Award size={18} style={{ color: '#D97757' }} /> Top 3 Más Vendidas
                    </h2>
                    <div className="space-y-2">
                        {topTres.map((planta, idx) => (
                            <div key={planta.id} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" 
                                    style={{ backgroundColor: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32', color: '#1B4332' }}>
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            {getIconoCategoria(planta.categoria)}
                                            <span className="font-bold text-sm" style={{ color: '#1B4332' }}>{planta.nombre}</span>
                                        </div>
                                        <span className="font-bold text-sm" style={{ color: '#D97757' }}>${planta.ganancia.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full mt-1" style={{ backgroundColor: '#CADBB7' }}>
                                        <div 
                                            className="h-1.5 rounded-full" 
                                            style={{ width: `${Math.min(100, (planta.ganancia / topTres[0].ganancia) * 100)}%`, backgroundColor: '#D97757' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border" style={{ borderColor: '#CADBB7' }}>
                    <DollarSign size={18} className="mx-auto mb-1" style={{ color: '#D97757' }} />
                    <p className="text-[10px]" style={{ color: '#93A267' }}>Total Ventas</p>
                    <p className="text-base font-bold" style={{ color: '#1B4332' }}>${resumen.total_ventas.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border" style={{ borderColor: '#CADBB7' }}>
                    <TrendingUp size={18} className="mx-auto mb-1" style={{ color: '#D97757' }} />
                    <p className="text-[10px]" style={{ color: '#93A267' }}>Ganancia Real</p>
                    <p className="text-base font-bold" style={{ color: '#D97757' }}>${resumen.total_ganancia.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border" style={{ borderColor: '#CADBB7' }}>
                    <Percent size={18} className="mx-auto mb-1" style={{ color: '#D97757' }} />
                    <p className="text-[10px]" style={{ color: '#93A267' }}>Comisión {porcentajes.comision}%</p>
                    <p className="text-sm font-bold" style={{ color: '#D97757' }}>${resumen.total_comision.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm border" style={{ borderColor: '#CADBB7' }}>
                    <PiggyBank size={18} className="mx-auto mb-1" style={{ color: '#D97757' }} />
                    <p className="text-[10px]" style={{ color: '#93A267' }}>Ahorro {porcentajes.ahorro}%</p>
                    <p className="text-sm font-bold" style={{ color: '#D97757' }}>${resumen.total_ahorro.toFixed(2)}</p>
                </div>
            </div>

            {/* Buscador */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                <input
                    type="text"
                    placeholder="Buscar planta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: '#CADBB7' }}
                />
            </div>

            {/* Ganancias por categoría */}
            <div>
                <h2 className="text-sm font-bold mb-2 flex items-center gap-1" style={{ color: '#1B4332' }}>
                    <Leaf size={14} /> Ganancias por categoría
                </h2>
                {listaCategorias.map(categoria => (
                    <SeccionCategoria key={categoria} categoria={categoria} />
                ))}
            </div>

            {/* Resumen final */}
            <div className="rounded-xl p-3" style={{ backgroundColor: '#E8EFE0' }}>
                <div className="flex justify-between items-center text-xs mb-1">
                    <div className="flex items-center gap-1">
                        <Award size={14} style={{ color: '#D97757' }} />
                        <span style={{ color: '#1B4332' }}>Planta más rentable:</span>
                    </div>
                    <span className="font-bold" style={{ color: '#D97757' }}>
                        {topTres[0]?.nombre || 'Ninguna'} - ${topTres[0]?.ganancia.toFixed(2) || '0'}
                    </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1">
                        <PiggyBank size={14} style={{ color: '#D97757' }} />
                        <span style={{ color: '#1B4332' }}>Total ahorrado:</span>
                    </div>
                    <span className="font-bold" style={{ color: '#D97757' }}>${resumen.total_ahorro.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}

export default ReporteGanancias;