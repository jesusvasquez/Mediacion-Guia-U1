import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Login() {
  const { login } = useAppContext();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      login(name, email);
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundImage: 'linear-gradient(135deg, var(--bg-color) 0%, #e0e0e0 100%)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', textAlign: 'center' }}>

        <img
          src="https://benune.github.io/home/images/LogoBENUNE_WhiteCircleBG.png"
          alt="Logotipo BENUNE"
          style={{ width: '250px', height: '250px', borderRadius: '50%', margin: '0 auto 1.5rem auto', display: 'block', boxShadow: 'var(--shadow-sm)' }}
        />

        <h1 className="text-2xl" style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Entorno Digital de Aprendizaje</h1>
        <p className="text-sm text-muted" style={{ marginBottom: '2rem' }}>
          Ingresa tus datos para personalizar tu experiencia. Se almacenarán localmente.
        </p>

        <form onSubmit={handleSubmit} className="flex-col space-y-4">
          <div style={{ textAlign: 'left' }}>
            <label className="text-sm" htmlFor="name" style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Nombre Completo</label>
            <input
              id="name"
              type="text"
              className="input-field"
              placeholder="Ej. María López Sánchez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label className="text-sm" htmlFor="email" style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Correo Electrónico Institucional</label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="usuario@edubc.mx"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.875rem' }}>
            Acceder a la Guía
          </button>
        </form>
      </div>
    </div>
  );
}
