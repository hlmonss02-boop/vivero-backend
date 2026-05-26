import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
    ShoppingCart,
    Receipt,
    Leaf,
    Truck,
    Users,
    BarChart3,
    AlertTriangle,
    LogOut,
    Menu,
    X,
    UserCircle,
    ClipboardList
} from 'lucide-react';

function Layout() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const isDueño = usuario.rol === 'Dueño';
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

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

    const getPageIcon = () => {
        const currentItem = filteredMenu.find(item => item.to === location.pathname);
        const Icon = currentItem?.icon || BarChart3;
        return <Icon size={24} className="mr-2" style={{ color: '#93A267' }} />;
    };

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: '#FBFBFB' }}>
            {/* Sidebar */}
            <aside 
                className={`shadow-xl transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-72' : 'w-20'} flex flex-col h-screen sticky top-0`}
                style={{ backgroundColor: '#485935' }}
            >
                <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                    {/* Logo */}
                    <div className={`flex items-center mb-8 ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#93A267' }}>
                            <Leaf size={20} style={{ color: 'white' }} />
                        </div>
                        {sidebarOpen && (
                            <h1 className="text-xl font-bold text-white truncate">Vivero Juanito</h1>
                        )}
                    </div>
                    
                    {/* Perfil */}
                    <div className={`mb-8 p-3 rounded-xl ${sidebarOpen ? '' : 'text-center'}`} style={{ backgroundColor: '#3A4A2E' }}>
                        {sidebarOpen ? (
                            <>
                                <p className="text-white/70 text-xs">Bienvenido</p>
                                <p className="text-white font-semibold mt-1 text-sm truncate">{usuario.nombre}</p>
                                <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#93A267', color: 'white' }}>
                                    {usuario.rol}
                                </span>
                            </>
                        ) : (
                            <div className="flex justify-center">
                                <UserCircle size={28} style={{ color: '#CADBB7' }} />
                            </div>
                        )}
                    </div>

                    {/* Navegación */}
                    <nav className="space-y-1">
                        {filteredMenu.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.to;
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl transition-all duration-200 ${
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
                                    <Icon size={20} className="shrink-0" />
                                    {sidebarOpen && (
                                        <div>
                                            <p className="font-medium text-sm">{item.title}</p>
                                            <p className="text-xs opacity-70">{item.desc}</p>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Botón salir */}
                <div className="p-4 border-t shrink-0" style={{ borderTopColor: '#3A4A2E' }}>
                    <Link
                        to="/login"
                        className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl w-full transition hover:bg-[#3A4A2E]`}
                        style={{ color: '#CADBB7' }}
                    >
                        <LogOut size={20} className="shrink-0" />
                        {sidebarOpen && (
                            <div>
                                <p className="font-medium text-sm">Salir</p>
                                <p className="text-xs opacity-70">Cerrar sesión</p>
                            </div>
                        )}
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center">
                        {getPageIcon()}
                        <div>
                            <h2 className="text-2xl font-bold" style={{ color: '#485935' }}>{getPageTitle()}</h2>
                            <p className="text-sm mt-1" style={{ color: '#93A267' }}>Resumen y estadísticas del negocio</p>
                        </div>
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

export default Layout;