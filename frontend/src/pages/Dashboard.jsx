import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    ShoppingCart, Receipt, Leaf, Truck, Users, 
    BarChart3, AlertTriangle, LogOut, Menu, X, UserCircle,
    ClipboardList
} from 'lucide-react';

import { API_URL } from '../config';

function Dashboard() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const isDueño = usuario.rol === 'Dueño';
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        { to: "/dashboard/ventas", icon: ShoppingCart, title: "Punto de Venta", desc: "Registrar ventas" },
        { to: "/dashboard/mis-ventas", icon: Receipt, title: "Mis Ventas", desc: isDueño ? "Todas las ventas" : "Tus ventas" },
        { to: "/dashboard/plantas", icon: Leaf, title: "Plantas", desc: "Gestionar catálogo", admin: true },
        { to: "/dashboard/proveedores", icon: Truck, title: "Proveedores", desc: "Gestionar proveedores", admin: true },
        { to: "/dashboard/usuarios", icon: Users, title: "Usuarios", desc: "Gestionar vendedores", admin: true },
        { to: "/dashboard/reporte-ganancias", icon: BarChart3, title: "Ganancias", desc: "Reporte por planta", admin: true },
        { to: "/dashboard/mermas", icon: AlertTriangle, title: "Mermas", desc: "Plantas perdidas", admin: true },
        { to: "/dashboard/pedidos", icon: ClipboardList, title: "Pedidos", desc: "Pedidos de clientes", admin: true }
    ];

    const filteredMenu = menuItems.filter(item => !item.admin || (item.admin && isDueño));

    const getPageTitle = () => {
        const currentItem = filteredMenu.find(item => item.to === location.pathname);
        return currentItem ? currentItem.title : "Panel de Control";
    };

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: '#F8FAF9' }}>
            {/* Sidebar - con flex column para que el botón salir se quede abajo */}
            <aside 
                className={`shadow-xl transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-56' : 'w-16'} flex flex-col h-screen sticky top-0`}
                style={{ backgroundColor: '#485935' }}
            >
                {/* Contenido scrolleable (menú) */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {/* Logo */}
                    <div className={`flex items-center ${sidebarOpen ? 'justify-start gap-2 p-3' : 'justify-center p-3'}`}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#93A267' }}>
                            <Leaf size={16} style={{ color: 'white' }} />
                        </div>
                        {sidebarOpen && (
                            <h1 className="text-sm font-bold text-white truncate">Vivero Juanito</h1>
                        )}
                    </div>
                    
                    {/* Perfil */}
                    <div className={`mb-4 ${sidebarOpen ? 'mx-3 p-2 rounded-xl' : 'mx-2 p-2 rounded-xl text-center'}`} style={{ backgroundColor: '#3A4A2E' }}>
                        {sidebarOpen ? (
                            <>
                                <p className="text-white/70 text-[10px]">Bienvenido</p>
                                <p className="text-white font-semibold mt-1 text-xs truncate">{usuario.nombre}</p>
                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: '#93A267', color: 'white' }}>
                                    {usuario.rol}
                                </span>
                            </>
                        ) : (
                            <div className="flex justify-center">
                                <UserCircle size={22} style={{ color: '#CADBB7' }} />
                            </div>
                        )}
                    </div>

                    {/* Menú de navegación */}
                    <nav className="space-y-0.5">
                        {filteredMenu.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.to;
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => {
                                        if (window.innerWidth < 768) setSidebarOpen(false);
                                    }}
                                    className={`flex items-center ${sidebarOpen ? 'gap-2 mx-2 px-2' : 'justify-center mx-1 px-1'} py-2 rounded-lg transition-all duration-200 ${
                                        isActive ? 'bg-[#3A4A2E]' : ''
                                    }`}
                                    style={{ color: '#CADBB7' }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = '#3A4A2E';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <Icon size={18} className="shrink-0" />
                                    {sidebarOpen && (
                                        <div className="flex-1">
                                            <p className="font-medium text-xs">{item.title}</p>
                                            <p className="text-[10px] opacity-70">{item.desc}</p>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Botón salir - SIEMPRE FIJO EN LA PARTE INFERIOR */}
                <div className={`border-t shrink-0 ${sidebarOpen ? 'p-3' : 'p-2'}`} style={{ borderTopColor: '#3A4A2E' }}>
                    <Link
                        to="/login"
                        className={`flex items-center ${sidebarOpen ? 'gap-2 px-2' : 'justify-center'} py-2 rounded-lg w-full transition hover:bg-[#3A4A2E]`}
                        style={{ color: '#CADBB7' }}
                    >
                        <LogOut size={18} className="shrink-0" />
                        {sidebarOpen && (
                            <div>
                                <p className="font-medium text-xs">Salir</p>
                                <p className="text-[10px] opacity-70">Cerrar sesión</p>
                            </div>
                        )}
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-6 md:mb-8">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl md:text-2xl font-bold" style={{ color: '#1B4332' }}>{getPageTitle()}</h2>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg transition hover:scale-105"
                        style={{ backgroundColor: '#CADBB7', color: '#485935' }}
                    >
                        {sidebarOpen ? <Menu size={20} /> : <X size={20} />}
                    </button>
                </div>
                <Outlet />
            </main>
        </div>
    );
}

export default Dashboard;