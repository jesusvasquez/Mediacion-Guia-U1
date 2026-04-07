import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertTriangle, ArrowDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface ModuleData {
  moduloId: string;
  temaPrincipal: string;
  descripcionGeneral: string;
  extractos: {
    id: number;
    titulo: string;
    contenido: string;
    puntosClave: string[];
    fuente: string;
    color: string;
  }[];
  organizadorPrevio: {
    fases: { nombre: string; descripcion: string }[];
  };
  miniTest: {
    pregunta: string;
    opciones: string[];
    respuesta: string;
  }[];
}

interface GenericModuleViewProps {
  data: ModuleData;
}

export default function GenericModuleView({ data }: GenericModuleViewProps) {
  const { markModuleCompleted } = useAppContext();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [locked, setLocked] = useState<Record<number, boolean>>({});

  // Reset state when data changes (e.g. switching modules)
  useEffect(() => {
    setAnswers({});
    setLocked({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [data.moduloId]);

  // Check completion
  useEffect(() => {
    if (data.miniTest.length > 0 && Object.keys(locked).length === data.miniTest.length) {
      let correctCount = 0;
      data.miniTest.forEach((q, index) => {
        if (answers[index] === q.respuesta) {
          correctCount++;
        }
      });
      
      const percentage = (correctCount / data.miniTest.length) * 100;
      
      if (percentage >= 60) {
        // Mark modulo as completed when reached >= 60%
        markModuleCompleted(data.moduloId);
      }
    }
  }, [locked, data.moduloId, data.miniTest, answers, markModuleCompleted]);

  const handleSelect = (qIndex: number, option: string) => {
    if (locked[qIndex]) return;
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const handleCheck = (qIndex: number) => {
    setLocked(prev => ({ ...prev, [qIndex]: true }));
  };

  const handleRetry = () => {
    setAnswers({});
    setLocked({});
  };

  const allLocked = data.miniTest.length > 0 && Object.keys(locked).length === data.miniTest.length;
  let scorePercentage = 0;
  if (allLocked) {
    let correctCount = data.miniTest.filter((q, idx) => answers[idx] === q.respuesta).length;
    scorePercentage = (correctCount / data.miniTest.length) * 100;
  }

  return (
    <div className="flex-col animate-fade-in" style={{ gap: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <p className="text-sm text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Módulo {data.moduloId}</p>
        <h1 className="text-3xl" style={{ color: 'var(--primary)', marginBottom: '1rem', fontWeight: 700 }}>{data.temaPrincipal}</h1>
        <p className="text-lg text-muted" style={{ lineHeight: 1.6, maxWidth: '800px', margin: '0 auto' }}>
          {data.descripcionGeneral}
        </p>
      </div>

      {/* ORGANIZADOR PREVIO (DYNAMIC CONCEPT MAP) */}
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <h3 className="text-xl" style={{ color: 'var(--secondary)', marginBottom: '2.5rem', fontWeight: 600 }}>Organizador Previo: Mapa de Ruta</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          {data.organizadorPrevio.fases.map((fase, index) => (
            <React.Fragment key={index}>
              <div 
                className="step-card"
                style={{ 
                  width: '100%', 
                  maxWidth: '450px', 
                  padding: '1.25rem', 
                  background: index === 0 ? 'var(--surface-hover)' : 'var(--bg-color)', 
                  borderRadius: '12px', 
                  border: `1px solid ${index === data.organizadorPrevio.fases.length - 1 ? 'var(--secondary)' : 'var(--border-light)'}`, 
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.2s ease',
                  borderLeft: `4px solid ${index === data.organizadorPrevio.fases.length - 1 ? 'var(--secondary)' : 'var(--primary)'}`
                }}
              >
                <h4 style={{ color: index === data.organizadorPrevio.fases.length - 1 ? 'var(--secondary)' : 'var(--primary)', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                    {fase.nombre}
                </h4>
                <p className="text-sm text-muted" style={{ fontSize: '0.85rem' }}>{fase.descripcion}</p>
              </div>
              {index < data.organizadorPrevio.fases.length - 1 && (
                <ArrowDown size={20} color="var(--primary)" style={{ opacity: 0.4, margin: '0.25rem 0' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* DOWNLOAD PDF ACTION */}
      <div style={{ textAlign: 'center', marginTop: '-1rem', marginBottom: '1.5rem' }}>
        <a 
          href={`/pdfs/ApuntesEstudioM${data.moduloId}.pdf`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-secondary" 
          style={{ display: 'inline-flex', gap: '0.75rem', textDecoration: 'none', padding: '0.75rem 2rem' }}
        >
          <FileText size={18} /> Descargar Guía de Apuntes Módulo {data.moduloId} (PDF)
        </a>
      </div>

      {/* APUNTES DE ESTUDIO (CARDS FROM JSON) */}
      <div style={{ textAlign: 'center' }}>
        <h3 className="text-2xl" style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 600 }}>Esenciales del Módulo</h3>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {data.extractos.map((ext) => (
          <div 
            key={ext.id} 
            className="glass-panel" 
            style={{ 
              padding: '2rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem', 
              borderTop: `6px solid ${ext.color || 'var(--primary)'}`,
              transition: 'transform 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
               <CheckCircle size={22} color={ext.color || 'var(--primary)'} />
               <h3 className="text-lg" style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.05rem' }}>{ext.titulo}</h3>
            </div>
            
            <p className="text-sm" style={{ color: 'var(--text-main)', lineHeight: 1.7, flexGrow: 1 }}>
              {ext.contenido}
            </p>

            <div style={{ marginTop: '0.5rem' }}>
              <p className="text-xs" style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Conceptos Rescatados:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {ext.puntosClave.map((punto, pIdx) => (
                  <span 
                    key={pIdx} 
                    className="text-xs" 
                    style={{ 
                      padding: '0.25rem 0.75rem', 
                      background: 'rgba(0,0,0,0.04)', 
                      borderRadius: '12px', 
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    {punto}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
              <a 
                href={`/pdfs/${ext.fuente}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary text-xs" 
                style={{ width: '100%', gap: '0.5rem' }}
              >
                <FileText size={14} /> Fuente: {ext.fuente.replace('.pdf', '').replace(/_/g, ' ')}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* MINI TEST INTERACTIVO */}
      <div style={{ padding: '3rem', background: 'var(--surface)', borderRadius: '20px', boxShadow: 'var(--shadow-ambient)', border: '1px solid var(--border-light)', marginTop: '2rem' }}>
        <h3 className="text-2xl" style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 600 }}>Autocomprobación</h3>
        <p className="text-sm text-muted" style={{ marginBottom: '2.5rem' }}>Demuestra tu comprensión de los extractos clave para consolidar tus saberes.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {data.miniTest.map((q, qIndex) => {
             const questionLocked = !!locked[qIndex];
             
             return (
               <div key={qIndex} style={{ animation: 'fadeUp 0.5s ease backwards', animationDelay: `${qIndex * 0.1}s` }}>
                 <p className="text-lg" style={{ fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', gap: '0.75rem' }}>
                   <span style={{ color: 'var(--primary)', opacity: 0.5 }}>{qIndex + 1}.</span>
                   {q.pregunta}
                 </p>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                   {q.opciones.map((op, idx) => {
                      const selected = answers[qIndex] === op;
                      const isCorrect = op === q.respuesta;

                      let bg = selected ? 'var(--primary-light)' : 'var(--bg-color)';
                      let border = selected ? 'var(--primary)' : 'var(--border-light)';
                      let textColor = 'var(--text-main)';

                      if (questionLocked) {
                        if (isCorrect) {
                          bg = '#e6f4ea';
                          border = '#34a853';
                          textColor = '#0d5d2a';
                        } else if (selected && !isCorrect) {
                          bg = '#fce8e6';
                          border = '#ea4335';
                          textColor = '#a52828';
                        }
                      }

                      return (
                        <label 
                          key={idx}
                          style={{
                            display: 'flex', alignItems: 'center', padding: '1.15rem', borderRadius: '12px',
                            border: `2px solid ${border}`, background: bg, cursor: questionLocked ? 'default' : 'pointer',
                            color: textColor, transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            opacity: questionLocked && !selected && !isCorrect ? 0.5 : 1,
                            boxShadow: selected && !questionLocked ? '0 4px 12px rgba(86, 12, 12, 0.1)' : 'none',
                            transform: selected && !questionLocked ? 'scale(1.01)' : 'scale(1)'
                          }}
                        >
                          <input 
                            type="radio" 
                            name={`minitest-${qIndex}`} 
                            value={op}
                            checked={selected}
                            onChange={() => handleSelect(qIndex, op)}
                            disabled={questionLocked}
                            style={{ marginRight: '1rem', transform: 'scale(1.3)', accentColor: 'var(--primary)' }}
                          />
                          <span style={{ fontWeight: selected ? 600 : 400, flex: 1 }}>{op}</span>
                        </label>
                      )
                   })}
                 </div>

                 {!questionLocked && answers[qIndex] && (
                   <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                     <button onClick={() => handleCheck(qIndex)} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '25px' }}>
                       Validar Respuesta
                     </button>
                   </div>
                 )}

                 {questionLocked && (
                   <div style={{ 
                     marginTop: '1.5rem', 
                     padding: '1rem', 
                     borderRadius: '10px', 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: '1rem', 
                     background: answers[qIndex] === q.respuesta ? '#e6f4ea' : '#fce8e6',
                     color: answers[qIndex] === q.respuesta ? '#0d5d2a' : '#a52828'
                   }}>
                     {answers[qIndex] === q.respuesta ? <CheckCircle size={22} /> : <AlertTriangle size={22} />}
                     <span style={{ fontWeight: 600, fontSize: '14px' }}>
                       {answers[qIndex] === q.respuesta ? '¡Excelente! Has captado la esencia del concepto.' : `Inexacto. Referencia correcta: "${q.respuesta}"`}
                     </span>
                   </div>
                 )}
               </div>
             )
          })}
        </div>

        {allLocked && (
          <div style={{
            marginTop: '3rem', padding: '2rem', borderRadius: '12px', textAlign: 'center',
            background: scorePercentage >= 60 ? 'var(--primary-light)' : '#fce8e6',
            border: `2px solid ${scorePercentage >= 60 ? 'var(--primary)' : '#ea4335'}`
          }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: scorePercentage >= 60 ? 'var(--primary)' : '#842029', marginBottom: '0.5rem' }}>
              Puntuación: {Math.round(scorePercentage)}%
            </h4>
            
            {scorePercentage >= 60 ? (
              <p style={{ color: 'var(--text-main)', marginBottom: '0' }}>
                ¡Excelente! Has superado el 60% requerido. El avance ha sido registrado en tu guía.
              </p>
            ) : (
              <>
                <p style={{ color: '#842029', marginBottom: '1.5rem' }}>
                  No has alcanzado el mínimo del 60% para avanzar. Repasa los extractos conceptuales y vuelve a intentarlo.
                </p>
                <button onClick={handleRetry} className="btn" style={{ background: '#ea4335', color: 'white' }}>
                  Reintentar Comprobación
                </button>
              </>
            )}
          </div>
        )}
      </div>


    </div>
  );
}
