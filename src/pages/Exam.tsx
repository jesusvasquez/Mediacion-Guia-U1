import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import reactivosData from '../data/reactivos.json';
import { useAppContext } from '../context/AppContext';

interface Question {
  id: number;
  tema: string;
  pregunta: string;
  opciones: string[];
  respuesta_correcta: string;
}

export interface ExamHistoryItem {
  question: Question;
  selectedOption: string;
  isCorrect: boolean;
}

export default function Exam() {
  const navigate = useNavigate();
  const { completedModules } = useAppContext();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Track answers and if the user has locked their answer for the current question
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLocked, setIsLocked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // We only randomise if there's no active session or they hit "retake". 
    // To handle retakes naturally, we just mount and randomize.
    const shuffled = [...reactivosData.catalogo].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 20));
  }, []);

  if (completedModules.length < 4) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ padding: '2rem', background: 'var(--surface)', borderRadius: '50%', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
          <Lock size={48} color="var(--primary)" />
        </div>
        <h2 className="text-2xl" style={{ color: 'var(--primary)', marginBottom: '1rem', fontWeight: 600 }}>Evaluación Bloqueada</h2>
        <p className="text-base text-muted" style={{ maxWidth: '400px', marginBottom: '2rem', lineHeight: 1.6 }}>
          Debes completar el 100% de la ruta de estudio (comprobar el aprendizaje en los 4 módulos) antes de poder desbloquear tu evaluación final.
        </p>
        <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Volver al Inicio
        </Link>
      </div>
    );
  }

  if (questions.length === 0) return <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando reactivos...</div>;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  // Determine if current question has been locked in by the user
  const questionLocked = !!isLocked[currentQuestion.id];

  const handleOptionSelect = (option: string) => {
    if (questionLocked) return; // Prevention measure
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
  };

  const handleLockInAnswer = () => {
    setIsLocked(prev => ({ ...prev, [currentQuestion.id]: true }));
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => prev - 1);
  };

  const handleFinish = () => {
    // Generate full history object
    const history: ExamHistoryItem[] = questions.map(q => {
      const selectedOption = answers[q.id];
      const isCorrect = selectedOption === q.respuesta_correcta;
      return {
        question: q,
        selectedOption,
        isCorrect
      };
    });

    localStorage.setItem('benune_exam_history', JSON.stringify(history));
    
    let correct = history.filter(h => h.isCorrect).length;
    const scorePercentage = (correct / questions.length) * 100;
    localStorage.setItem('benune_score', scorePercentage.toString());
    
    navigate('/resultados');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Immersive minimalist header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p className="text-sm text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px' }}>
          Pregunta {currentIndex + 1} de {questions.length}
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '3rem' }}>
        <h2 className="text-2xl" style={{ marginBottom: '2rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
          {currentQuestion.pregunta}
        </h2>
        
        <div className="flex-col" style={{ gap: '1rem' }}>
          {currentQuestion.opciones.map((op, idx) => {
            const isSelected = answers[currentQuestion.id] === op;
            const isCorrectAnswer = op === currentQuestion.respuesta_correcta;
            
            // Base styling DUA
            let bg = isSelected ? 'var(--primary-light)' : 'var(--surface)';
            let border = isSelected ? 'var(--primary)' : 'var(--border-light)';
            let textColor = 'var(--text-main)';

            // Feedback coloring when locked
            if (questionLocked) {
              if (isCorrectAnswer) {
                bg = '#e6f4ea'; // soft green
                border = '#34a853'; // strong green
                textColor = '#0f5132';
              } else if (isSelected && !isCorrectAnswer) {
                bg = '#fce8e6'; // soft red
                border = '#ea4335'; // strong red
                textColor = '#842029';
              } else {
                // Not selected and not correct
                bg = 'var(--surface)';
                border = 'var(--border-light)';
                textColor = 'var(--text-muted)';
              }
            }

            return (
              <label 
                key={idx} 
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', 
                  borderRadius: 'var(--border-radius)', border: `2px solid ${border}`,
                  cursor: questionLocked ? 'default' : 'pointer', background: bg,
                  color: textColor,
                  transition: 'all 0.2s ease', opacity: questionLocked && !isSelected && !isCorrectAnswer ? 0.6 : 1
                }}
              >
                <input 
                  type="radio" 
                  name={`q-${currentQuestion.id}`} 
                  value={op}
                  checked={isSelected}
                  onChange={() => handleOptionSelect(op)}
                  disabled={questionLocked}
                  style={{ marginRight: '1rem', accentColor: questionLocked && isCorrectAnswer ? '#34a853' : 'var(--primary)', transform: 'scale(1.2)' }}
                />
                <span className="text-base" style={{ fontWeight: questionLocked && (isSelected || isCorrectAnswer) ? 600 : 400 }}>{op}</span>
              </label>
            );
          })}
        </div>

        {questionLocked && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '8px', background: answers[currentQuestion.id] === currentQuestion.respuesta_correcta ? '#e6f4ea' : '#fce8e6' }}>
            <p className="text-sm" style={{ color: answers[currentQuestion.id] === currentQuestion.respuesta_correcta ? '#0d5121' : '#842029', fontWeight: 600 }}>
              {answers[currentQuestion.id] === currentQuestion.respuesta_correcta 
                ? "¡Correcto! Has identificado adecuadamente el concepto." 
                : "Respuesta incorrecta. Recuerda que la respuesta correcta está resaltada en verde."}
            </p>
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
        {currentIndex > 0 && (
          <button onClick={handlePrev} className="btn btn-secondary">
            Atrás
          </button>
        )}
        
        {!questionLocked ? (
          <button 
            onClick={handleLockInAnswer} 
            className="btn btn-primary"
            disabled={!answers[currentQuestion.id]}
            style={{ opacity: !answers[currentQuestion.id] ? 0.5 : 1 }}
          >
            Confirmar Respuesta
          </button>
        ) : (
          <>
            {!isLastQuestion ? (
              <button 
                onClick={handleNext} 
                className="btn btn-secondary"
              >
                Siguiente Pregunta
              </button>
            ) : (
              <button 
                onClick={handleFinish} 
                className="btn btn-primary"
              >
                Finalizar y Ver Resultados
              </button>
            )}
          </>
        )}
      </div>

    </div>
  );
}
