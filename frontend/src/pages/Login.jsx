import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { Mail, Lock, LogIn, Leaf } from 'lucide-react';

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    correo: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginUser(form);

      localStorage.setItem('token', data.token);
      localStorage.setItem('rol', data.usuario.rol);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      if (data.usuario.rol === 'Dueño') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ 
        backgroundImage: 'url(/logo.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#F8FAF9'
      }}
    >
      {/* Capa de opacidad para que el formulario sea legible */}
      <div className="absolute inset-0" style={{ backgroundColor: '#F8FAF9', opacity: 0.85 }}></div>

      {/* Contenido del formulario */}
      <div className="relative z-10 w-full max-w-md">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#1B4332' }}>Vivero Juanito</h1>
          <p className="text-sm mt-2" style={{ color: '#93A267' }}>Sistema de gestión de ventas</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#1B4332' }}>
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                <input
                  type="email"
                  name="correo"
                  placeholder="admin@vivero.com"
                  value={form.correo}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition"
                  style={{ borderColor: '#CADBB7', backgroundColor: '#F8FAF9' }}
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#1B4332' }}>
                Contraseña
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#93A267' }} />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition"
                  style={{ borderColor: '#CADBB7', backgroundColor: '#F8FAF9' }}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl text-sm text-center" style={{ backgroundColor: '#FCE4E4', color: '#D97757' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 text-white"
              style={{ backgroundColor: '#D97757' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <LogIn size={18} />
              )}
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Enlace al catálogo público - AHORA APUNTA A "/" */}
          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="text-sm transition hover:underline flex items-center justify-center gap-1"
              style={{ color: '#93A267' }}
            >
              <Leaf size={14} /> Ver catálogo público
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: '#93A267' }}>
          © 2026 Vivero Juanito - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}

export default Login;