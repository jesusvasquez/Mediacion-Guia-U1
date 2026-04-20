import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, AlertCircle } from 'lucide-react';
import reactivosData from '../data/reactivos.json';
import { useAppContext } from '../context/AppContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

interface Question {
  id: number;
  tema: string;
  pregunta: string;
  opciones: string[];
  respuesta_correcta: string;
}

export interface FinalExamHistoryItem {
  question: Question;
  selectedOption: string;
  isCorrect: boolean;
}

export default function FinalExam() {
  const navigate = useNavigate();
  const { userName, userEmail } = useAppContext();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const AVAILABILITY_DATE = new Date('2026-04-20T20:30:00');
  const EXPIRATION_DATE = new Date('2026-04-20T22:05:00');

  useEffect(() => {
    // Availability and Security check
    const checkStatus = async () => {
      const now = new Date();
      // Allow testing in localhost or after the date
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const available = (now >= AVAILABILITY_DATE && now <= EXPIRATION_DATE) || isLocal;
      const expired = now > EXPIRATION_DATE && !isLocal;
      
      setIsAvailable(available);

      if (!available && !expired) {
        const diff = AVAILABILITY_DATE.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      }
      
      if (expired) {
        navigate('/dashboard');
      }

      // Security check: has already taken?
      if (userEmail) {
        try {
          const q = query(
            collection(db, "resultados"), 
            where("email", "==", userEmail),
            where("type", "==", "final")
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            navigate('/resultados');
          }
        } catch (e) {
          console.error("Error checking exam status: ", e);
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);

    // Question selection logic (Proportional)
    const allReactivos = reactivosData.catalogo as Question[];
    
    const getRandom = (arr: Question[], n: number) => {
      return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
    };

    const asQuestions = allReactivos.filter(r => r.tema === "Aprendizaje Significativo");
    const duaQuestions = allReactivos.filter(r => r.tema === "Diseño Universal para el Aprendizaje");
    const mpQuestions = allReactivos.filter(r => r.tema === "Mediación Pedagógica");
    const poQuestions = allReactivos.filter(r => r.tema === "La Pauta de Observación");

    const selected = [
      ...getRandom(asQuestions, 4),
      ...getRandom(duaQuestions, 7),
      ...getRandom(mpQuestions, 6),
      ...getRandom(poQuestions, 3)
    ].sort(() => 0.5 - Math.random());

    setQuestions(selected);

    return () => clearInterval(interval);
  }, [userEmail, navigate]);

  // Access logic: Only blocked by date (except on localhost), guide completion restriction removed as requested.
  if (!isAvailable) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ padding: '2rem', background: 'var(--surface)', borderRadius: '50%', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
          <Clock size={48} color="var(--secondary)" />
        </div>
        <h2 className="text-2xl" style={{ color: 'var(--secondary)', marginBottom: '1rem', fontWeight: 600 }}>Examen no disponible</h2>
        <p className="text-base text-muted" style={{ maxWidth: '450px', marginBottom: '2rem', lineHeight: 1.6 }}>
          El examen final de la Unidad 1 se habilitará automáticamente el <strong>lunes 20 de abril a las 8:30 PM</strong>.
        </p>
        <div style={{ padding: '1rem 2rem', background: 'var(--secondary-light)', borderRadius: '8px', color: 'var(--secondary)', fontWeight: 700, fontSize: '1.2rem' }}>
          Disponible en: {timeRemaining}
        </div>
        <Link to="/dashboard" className="btn btn-secondary" style={{ textDecoration: 'none', marginTop: '2rem' }}>
          Volver al Inicio
        </Link>
      </div>
    );
  }

  if (questions.length === 0) return <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando reactivos...</div>;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleOptionSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => prev - 1);
  };

  const handleFinish = async () => {
    const history: FinalExamHistoryItem[] = questions.map(q => {
      const selectedOption = answers[q.id];
      return {
        question: q,
        selectedOption,
        isCorrect: selectedOption === q.respuesta_correcta
      };
    });

    const correctCount = history.filter(h => h.isCorrect).length;
    const scorePercentage = (correctCount / questions.length) * 100;

    // Save to LocalStorage
    localStorage.setItem('benune_final_exam_history', JSON.stringify(history));
    localStorage.setItem('benune_final_score', scorePercentage.toString());
    localStorage.setItem('benune_exam_type', 'final');

    // Save to Firestore
    try {
      await addDoc(collection(db, "resultados"), {
        estudiante: userName,
        email: userEmail,
        score: scorePercentage,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        timestamp: serverTimestamp(),
        type: 'final',
        history: history.map(h => ({
          preguntaId: h.question.id,
          respuesta: h.selectedOption,
          esCorrecta: h.isCorrect
        }))
      });
    } catch (e) {
      console.error("Error saving result to Firestore: ", e);
      // Even if firestore fails (e.g. config not set), we proceed with local result
    }

    navigate('/resultados');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p className="text-sm text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px' }}>
          Examen Final - Unidad 1
        </p>
        <h3 className="text-xl" style={{ fontWeight: 700, color: 'var(--primary)', marginTop: '0.5rem' }}>
          Pregunta {currentIndex + 1} de {questions.length}
        </h3>
        <div style={{ width: '100%', height: '4px', background: 'var(--border-light)', borderRadius: '2px', marginTop: '1rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((currentIndex + 1) / questions.length) * 100}%`, background: 'var(--primary)', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.7 }}>
          <AlertCircle size={16} color="var(--text-muted)" />
          <span className="text-xs text-muted">Sin retroalimentación</span>
        </div>

        <h2 className="text-2xl" style={{ marginBottom: '2rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
          {currentQuestion.pregunta}
        </h2>
        
        <div className="flex-col" style={{ gap: '1rem' }}>
          {currentQuestion.opciones.map((op, idx) => {
            const isSelected = answers[currentQuestion.id] === op;
            
            return (
              <label 
                key={idx} 
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', 
                  borderRadius: 'var(--border-radius)', 
                  border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-light)'}`,
                  cursor: 'pointer', 
                  background: isSelected ? 'var(--primary-light)' : 'var(--surface)',
                  color: 'var(--text-main)',
                  transition: 'all 0.2s ease'
                }}
              >
                <input 
                  type="radio" 
                  name={`q-${currentQuestion.id}`} 
                  value={op}
                  checked={isSelected}
                  onChange={() => handleOptionSelect(op)}
                  style={{ marginRight: '1rem', accentColor: 'var(--primary)', transform: 'scale(1.2)' }}
                />
                <span className="text-base" style={{ fontWeight: isSelected ? 600 : 400 }}>{op}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button 
          onClick={handlePrev} 
          className="btn btn-secondary" 
          disabled={currentIndex === 0}
          style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
        >
          Anterior
        </button>
        
        {!isLastQuestion ? (
          <button 
            onClick={handleNext} 
            className="btn btn-primary"
            disabled={!answers[currentQuestion.id]}
            style={{ opacity: !answers[currentQuestion.id] ? 0.5 : 1 }}
          >
            Siguiente
          </button>
        ) : (
          <button 
            onClick={handleFinish} 
            className="btn"
            disabled={!answers[currentQuestion.id]}
            style={{ 
              background: 'linear-gradient(135deg, var(--secondary), #c2652a)',
              color: 'white',
              opacity: !answers[currentQuestion.id] ? 0.5 : 1,
              fontWeight: 600
            }}
          >
            Evaluar mi examen
          </button>
        )}
      </div>

    </div>
  );
}
