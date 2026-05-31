import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import CatalogoPublico from './pages/CatalogoPublico';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
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
        <BrowserRouter>
            <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<CatalogoPublico />} />
                <Route path="/login" element={<Login />} />

                {/* Dashboard con todas las rutas protegidas */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }>
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

                {/* Redirigir cualquier ruta no encontrada al login */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;