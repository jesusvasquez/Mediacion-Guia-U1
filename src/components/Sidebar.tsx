import { NavLink, useLocation } from 'react-router-dom';
import { Brain, LayoutDashboard, Users, Library, CheckCircle2, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { userName, completedModules } = useAppContext();
  const location = useLocation();

  const navItems = [
    { name: 'Módulo 1: Aprendizaje Significativo', path: '/modulo/1', icon: Brain },
    { name: 'Módulo 2: Diseño Universal para el Aprendizaje', path: '/modulo/2', icon: LayoutDashboard },
    { name: 'Módulo 3: La Mediación Pedagógica', path: '/modulo/3', icon: Users },
    { name: 'Módulo 4: La Pauta de Observación', path: '/modulo/4', icon: CheckCircle2 },
    { name: 'Evaluación Final', path: '/evaluacion', icon: CheckCircle2 },
    { name: 'Bibliografía', path: '/bibliografia', icon: Library },
  ];

  return (
    <aside
      className="sidebar-aside"
      style={{
        width: '280px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid var(--border-light)',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.3s ease',
        overflowY: 'auto'
      }}
    >
      {/* Mobile Close Button */}
      <button
        onClick={onClose}
        className="mobile-only"
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'none' // Controlled by CSS media query if I added a class
        }}
      >
        <X size={24} />
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <img
            src="https://benune.github.io/home/images/LogoBENUNE_WhiteCircleBG.png"
            alt="Logotipo"
            style={{ width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0 }}
          />
          <div>
            <h2 className="text-sm school-name desktop-only" style={{ color: 'var(--primary)', fontWeight: 700, lineHeight: 1.2 }}>Escuela Normal Urbana Nocturna del Estado</h2>
            <h2 className="text-sm school-name mobile-only-block" style={{ color: 'var(--primary)', fontWeight: 700, lineHeight: 1.2, display: 'none' }}>BENUNE</h2>
            <p className="text-xs" style={{ color: 'var(--secondary)', fontWeight: 600, marginTop: '0.1rem' }}>"Ing. José G. Valenzuela"</p>
          </div>
        </div>

        <div style={{ padding: '0.75rem', background: 'var(--primary-light)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
          <p className="text-xs" style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.2rem' }}>Curso: La Mediación Pedagógica y Estrategias de Trabajo Docente</p>
        </div>

        <div style={{ marginTop: '0.3rem', padding: '0.75rem', background: 'var(--secondary-light)', borderRadius: '8px', borderLeft: '4px solid var(--secondary)' }}>
          <p className="text-xs text-muted" style={{ fontWeight: 500 }}>Guía de Estudio - Unidad 1</p>
        </div>

        <p className="text-xs text-muted" style={{ marginTop: '0.75rem', textAlign: 'center' }}>Bienvenido, {userName}</p>
      </div>

      <div style={{
        background: 'var(--surface-hover)',
        borderRadius: 'var(--border-radius)',
        padding: '1.25rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <p className="text-sm font-semibold" style={{ fontWeight: 600, color: 'var(--text-main)' }}>Avance de Estudio</p>
          <span className="text-sm font-bold" style={{ color: 'var(--secondary)' }}>{Math.round((completedModules.length / 4) * 100)}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min((completedModules.length / 4) * 100, 100)}%`,
              background: 'var(--secondary)',
              transition: 'width 0.5s ease-in-out',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>

      <nav className="flex-col space-y-4" style={{ flex: 1, gap: '0.5rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          const isExam = item.path === '/evaluacion';
          const isLocked = isExam && completedModules.length < 4;
          const isBibliography = item.path === '/bibliografia';

          return (
            <div key={item.name} style={{ display: 'flex', flexDirection: 'column' }}>
              {isBibliography && (
                <div style={{ height: '2px', background: 'var(--border-light)', margin: '1rem 0 0.5rem 0', borderRadius: '1px' }} />
              )}
              <NavLink
                to={isLocked ? '#' : item.path}
                onClick={(e) => {
                  if (isLocked) {
                    e.preventDefault();
                  } else if (onClose) {
                    onClose();
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', padding: '0.875rem 1rem',
                  borderRadius: '8px', textDecoration: 'none',
                  color: isActive && !isLocked ? 'var(--primary)' : 'var(--text-main)',
                  backgroundColor: isActive && !isLocked ? 'var(--primary-light)' : 'transparent',
                  fontWeight: isActive && !isLocked ? 600 : 500,
                  transition: 'all 0.2s ease',
                  opacity: isLocked ? 0.5 : 1,
                  cursor: isLocked ? 'not-allowed' : 'pointer'
                }}
              >
                <Icon size={26} style={{ marginRight: '0.75rem' }} />
                <span className="text-sm">{item.name}</span>
              </NavLink>

              {isLocked && (
                <span className="text-xs" style={{ color: 'var(--text-muted)', marginLeft: '3.5rem', marginTop: '-0.2rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>
                  * Requiere 100% de avance
                </span>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
