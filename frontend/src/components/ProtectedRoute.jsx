import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
    // Verificar si hay un token en localStorage
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Si no hay token o no hay usuario, redirigir al login
    if (!token || !usuario.id_usuario) {
        return <Navigate to="/login" replace />;
    }

    // Si está autenticado, mostrar el contenido
    return children;
}

export default ProtectedRoute;