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
{/*no tocar este dibujo, fue hecho por desarrolladores antiguos 
_________________¶¶¶1___¶¶¶____¶¶¶1_______________
__________________¶¶¶____¶¶¶____1¶¶1______________
___________________¶¶¶____¶¶¶____¶¶¶______________
___________________¶¶¶____¶¶¶____¶¶¶______________
__________________¶¶¶____1¶¶1___1¶¶1______________
________________1¶¶¶____¶¶¶____¶¶¶1_______________
______________1¶¶¶____¶¶¶1___¶¶¶1_________________
_____________¶¶¶1___1¶¶1___1¶¶1___________________
____________1¶¶1___1¶¶1___1¶¶1____________________
____________1¶¶1___1¶¶1___1¶¶¶____________________
_____________¶¶¶____¶¶¶1___¶¶¶1___________________
______________¶¶¶¶___1¶¶¶___1¶¶¶__________________
_______________1¶¶¶1___¶¶¶1___¶¶¶¶________________
_________________1¶¶1____¶¶¶____¶¶¶_______________
___________________¶¶1____¶¶1____¶¶1______________
___________________¶¶¶____¶¶¶____¶¶¶______________
__________________1¶¶1___1¶¶1____¶¶1______________
_________________¶¶¶____¶¶¶1___1¶¶1_______________
________________11_____111_____11_________________
__________¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶________
1¶¶¶¶¶¶¶¶¶¶¶__¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶________
1¶¶¶¶¶¶¶¶¶¶¶__1¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶________
1¶¶_______¶¶__1¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶________
1¶¶_______¶¶__1¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶________
1¶¶_______¶¶__¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶________
1¶¶_______¶¶__1¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶________
_¶¶¶¶¶¶¶¶¶¶¶__¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶________
_¶¶¶¶¶¶¶¶¶¶¶__¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶________
__________¶¶___1¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶1________
__________1¶¶___¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶_________
____________¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶11__________
11_____________________________________________111
1¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶1
__¶¶111111111¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶¶111111111¶__
      */}
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