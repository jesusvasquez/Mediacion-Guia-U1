import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Type, Moon, Sun, Volume2, Menu, LogOut, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { userName, userEmail, highContrast, toggleContrast, increaseFontSize, decreaseFontSize, logout, resetProgress } = useAppContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const AVAILABILITY_DATE = new Date('2026-04-20T20:30:00');
  const EXPIRATION_DATE = new Date('2026-04-20T22:05:00');
  const [isExamEnabled, setIsExamEnabled] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [hasAlreadyTaken, setHasAlreadyTaken] = useState(false);

  useEffect(() => {
    const checkAvailability = async () => {
      const now = new Date();
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      const available = now >= AVAILABILITY_DATE || isLocal;
      const expired = now > EXPIRATION_DATE && !isLocal;
      
      setIsExamEnabled(available && !expired);
      setIsExpired(expired);

      // Check if already taken
      if (userEmail) {
        try {
          const q = query(
            collection(db, "resultados"), 
            where("email", "==", userEmail),
            where("type", "==", "final")
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setHasAlreadyTaken(true);
          }
        } catch (e) {
          console.error("Error checking exam status: ", e);
        }
      }
    };
    checkAvailability();
    const interval = setInterval(checkAvailability, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [userEmail]);

  // Basic mock TTS function
  const handleTTS = () => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance("Lector de pantalla activado.");
      window.speechSynthesis.speak(msg);
    } else {
      alert("Tu navegador no soporta lectura en voz alta.");
    }
  };

  return (
    <header className="glass topbar-header" style={{
      position: 'fixed',
      top: 0,
      right: 0,
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      zIndex: 40,
      borderBottom: '1px solid var(--border-light)',
      transition: 'left 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <button 
          onClick={onMenuClick}
          className="mobile-only-flex"
          style={{ 
            background: 'transparent', border: 'none', cursor: 'pointer', 
            padding: '0.5rem', borderRadius: '8px', display: 'none'
          }}
        >
          <Menu size={24} color="var(--primary)" />
        </button>

        <button onClick={toggleContrast} title="Cambiar Contraste" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}>
          {highContrast ? <Sun size={20} color="var(--primary)"/> : <Moon size={20} color="var(--text-main)"/>}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border-light)' }}>
          <button onClick={decreaseFontSize} title="Reducir Letra" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRight: '1px solid var(--border-light)' }}>
            <Type size={14} color="var(--text-main)" />
          </button>
          <button onClick={increaseFontSize} title="Aumentar Letra" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.4rem 0.8rem' }}>
            <Type size={18} color="var(--text-main)"/>
          </button>
        </div>
        <button onClick={handleTTS} title="Leer en voz alta" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}>
           <Volume2 size={20} color="var(--text-main)"/>
        </button>

        <div style={{ width: '1px', height: '20px', background: 'var(--border-light)', margin: '0 0.2rem' }} />

        <button 
          onClick={() => isExamEnabled && !hasAlreadyTaken && navigate('/examen-final')} 
          disabled={!isExamEnabled || hasAlreadyTaken || isExpired}
          title={
            hasAlreadyTaken 
              ? "Examen Final Completado (Ya has realizado tu evaluación)" 
              : isExpired
                ? "Examen Finalizado (El tiempo de aplicación ha terminado)"
                : isExamEnabled 
                  ? "Realizar Examen Final" 
                  : "Examen Final (Disponible lunes 20 de abril, 8:30 PM)"
          }
          style={{ 
            background: hasAlreadyTaken ? '#e6f4ea' : isExpired ? '#fbe9e7' : isExamEnabled ? 'var(--secondary-light)' : 'transparent', 
            border: 'none', 
            cursor: (isExamEnabled && !hasAlreadyTaken) ? 'pointer' : 'not-allowed', 
            padding: '0.5rem', 
            borderRadius: '50%',
            opacity: (isExamEnabled || hasAlreadyTaken || isExpired) ? 1 : 0.3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: (isExamEnabled && !hasAlreadyTaken) ? '0 0 10px rgba(var(--secondary-rgb), 0.2)' : 'none'
          }}
        >
           <CheckCircle2 size={22} color={hasAlreadyTaken ? "#34a853" : isExpired ? "#ea4335" : isExamEnabled ? "var(--secondary)" : "var(--text-muted)"}/>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
        <div style={{ textAlign: 'right' }}>
          <p className="text-sm" style={{ fontWeight: 600 }}>{userName || 'Estudiante'}</p>
        </div>
        
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {userName ? userName.charAt(0).toUpperCase() : 'E'}
        </button>

        {showDropdown && (
          <div style={{
            position: 'absolute', top: '50px', right: '0', background: 'var(--surface)',
            borderRadius: '12px', boxShadow: 'var(--shadow-ambient)', border: '1px solid var(--border-light)',
            padding: '0.5rem', width: '220px', display: 'flex', flexDirection: 'column', gap: '0.25rem',
            animation: 'fadeIn 0.2s ease'
          }}>
            <button 
              onClick={() => { resetProgress(); setShowDropdown(false); window.location.href = '/dashboard'; }}
              className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem', justifyContent: 'flex-start', gap: '0.5rem', background: 'transparent' }}
            >
              <RefreshCw size={16} /> Borrar mis Avances
            </button>
            <button 
              onClick={() => { logout(); setShowDropdown(false); window.location.href = '/login'; }}
              className="btn" style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem', justifyContent: 'flex-start', gap: '0.5rem', color: '#ea4335', background: 'transparent' }}
            >
              <LogOut size={16} /> Salir (Cerrar Sesión)
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
