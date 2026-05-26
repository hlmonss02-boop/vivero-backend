import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import CatalogoPublico from './pages/CatalogoPublico';
import Ventas from './pages/Ventas';
import Plantas from './pages/Plantas';
import Usuarios from './pages/Usuarios';
import MisVentas from './pages/MisVentas';
import ReporteGanancias from './pages/ReporteGanancias';
import Mermas from './pages/Mermas';
import Proveedores from './pages/Proveedores';
import PedidosClientes from './pages/PedidosClientes';
import DashboardHome from './pages/DashboardHome';

function App() {
    return (
        <BrowserRouter basename="/viveroJuanito">
            <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<CatalogoPublico />} />
                <Route path="/login" element={<Login />} />
                
                {/* Dashboard con todas las rutas anidadas */}
                <Route path="/dashboard" element={<Dashboard />}>
                    <Route index element={<DashboardHome />} />
                    <Route path="ventas" element={<Ventas />} />
                    <Route path="mis-ventas" element={<MisVentas />} />
                    <Route path="plantas" element={<Plantas />} />
                    <Route path="proveedores" element={<Proveedores />} />
                    <Route path="usuarios" element={<Usuarios />} />
                    <Route path="reporte-ganancias" element={<ReporteGanancias />} />
                    <Route path="mermas" element={<Mermas />} />
                    <Route path="pedidos" element={<PedidosClientes />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;