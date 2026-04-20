import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, CheckCircle, AlertTriangle, RotateCcw, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { ExamHistoryItem } from './Exam';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const THEME_METADATA: Record<string, { moduleId: string, path: string, readings: string[] }> = {
  "Aprendizaje Significativo": {
    moduleId: "1",
    path: "/modulo/1",
    readings: ["Ausubel - Psicología Educativa", "Yépez - Aprendizaje Significativo"]
  },
  "Diseño Universal para el Aprendizaje": {
    moduleId: "2",
    path: "/modulo/2",
    readings: ["Alba Pastor - DUA"]
  },
  "Mediación Pedagógica": {
    moduleId: "3",
    path: "/modulo/3",
    readings: ["Tébar - El Profesor Mediador", "Bodrova - Uso de Mediadores"]
  },
  "La Pauta de Observación": {
    moduleId: "4",
    path: "/modulo/4",
    readings: ["Cortez & Salcedo - Pautas de Observación"]
  }
};

export default function Results() {
  const { userName, userEmail } = useAppContext();
  const navigate = useNavigate();
  const [score, setScore] = useState<number | null>(null);
  const [history, setHistory] = useState<ExamHistoryItem[]>([]);

  useEffect(() => {
    const examType = localStorage.getItem('benune_exam_type') || 'simulator';
    const scoreKey = examType === 'final' ? 'benune_final_score' : 'benune_score';
    const historyKey = examType === 'final' ? 'benune_final_exam_history' : 'benune_exam_history';

    const savedScore = localStorage.getItem(scoreKey);
    const savedHistoryStr = localStorage.getItem(historyKey);

    if (savedScore) setScore(parseFloat(savedScore));
    else setScore(0);

    if (savedHistoryStr) {
      try {
        setHistory(JSON.parse(savedHistoryStr));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const examType = localStorage.getItem('benune_exam_type') || 'simulator';

  const themeStats = useMemo(() => {
    const stats: Record<string, { total: number, correct: number }> = {};
    history.forEach(item => {
      const t = item.question.tema;
      if (!stats[t]) stats[t] = { total: 0, correct: 0 };
      stats[t].total++;
      if (item.isCorrect) stats[t].correct++;
    });
    return Object.entries(stats).map(([name, data]) => ({
      name,
      percentage: (data.correct / (data.total || 1)) * 100,
      isSolid: ((data.correct / (data.total || 1)) * 100) >= 80,
      ...THEME_METADATA[name]
    }));
  }, [history]);

  const handleRetake = () => {
    if (examType === 'final') {
      localStorage.removeItem('benune_final_score');
      localStorage.removeItem('benune_final_exam_history');
      navigate('/examen-final');
    } else {
      localStorage.removeItem('benune_score');
      localStorage.removeItem('benune_exam_history');
      navigate('/evaluacion');
    }
  };

  const handleDownloadPDF = async () => {
    const loadImage = (url: string): Promise<string | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } else resolve(null);
        };
        img.onerror = () => resolve(null);
      });
    };

    const logoDataUrl = await loadImage('https://benune.github.io/home/images/LogoBENUNE_WhiteCircleBG.png');
    const doc = new jsPDF() as any;
    const roundedScore = Math.round(score || 0);

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 14, 10, 25, 25);
    }

    doc.setFontSize(14);
    doc.setTextColor(86, 12, 12);
    doc.setFont('helvetica', 'bold');
    doc.text("Benemérita Escuela Normal Urbana Nocturna", 42, 20);

    doc.setFontSize(11);
    doc.text("'Ing. José G. Valenzuela'", 42, 26);

    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.text("Curso: La Mediación Pedagógica y Estrategias de Trabajo Docente", 14, 42);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(examType === 'final' ? "Examen Final de Unidad 1" : "Simulacro de Evaluación - Unidad 1", 14, 52);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Estudiante: ${userName || 'No Registrado'}`, 14, 62);
    doc.text(`Correo electrónico: ${userEmail || 'No Registrado'}`, 14, 68);

    let scoreColor: [number, number, number] = [0, 0, 0];
    if (roundedScore >= 80) scoreColor = [15, 81, 50];
    else if (roundedScore >= 51) scoreColor = [210, 105, 30];
    else scoreColor = [132, 32, 41];

    doc.setFont('helvetica', 'bold');
    doc.text("Resultado de Evaluación: ", 14, 76);
    doc.setTextColor(...scoreColor);
    doc.text(` ${roundedScore}%`, 61, 76);

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Fecha de Emisión: ${today}`, 14, 82);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Resumen de Desempeño y Orientaciones", 14, 94);
    doc.setFont('helvetica', 'normal');

    const weakThemes = themeStats.filter(t => !t.isSolid);
    const firstName = (userName || '').split(' ')[0];

    let feedbackText = `Hola ${firstName}. Tu desempeño general ha sido de ${roundedScore}%. `;

    if (weakThemes.length === 0) {
      feedbackText += "¡Felicidades! Has demostrado un dominio sobresaliente en todos los ejes temáticos evaluados. Posees una estructura cognitiva sólida respecto a la Mediación Pedagógica y el DUA.";
    } else {
      feedbackText += "Para fortalecer tus aprendizajes, te sugiero profundizar en los siguientes temas: ";
      feedbackText += weakThemes.map(t => `${t.name} (Refuerza con lecturas de: ${t.readings.join(', ')})`).join('; ') + ".";
    }

    const splitFeedback = doc.splitTextToSize(feedbackText, 180);
    doc.text(splitFeedback, 14, 102);

    const tableData = history.map((item, index) => [
      (index + 1).toString(),
      item.question.pregunta,
      item.question.tema,
      item.isCorrect ? "Correcto" : "Incorrecto"
    ]);

    autoTable(doc, {
      startY: 130,
      head: [['#', 'Pregunta', 'Tema Evaluado', 'Resultado']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [86, 12, 12] },
      columnStyles: { 1: { cellWidth: 100 } },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 3) {
          if (data.cell.raw === "Correcto") {
            data.cell.styles.textColor = [15, 81, 50];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [132, 32, 41];
          }
        }
      },
      didDrawPage: (data: any) => {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
        const margin = data.settings.margin.left;
        const footerY = pageHeight - 10;

        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.1);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        doc.setFontSize(7);
        doc.setTextColor(60, 60, 60);
        doc.text(userName || 'No Registrado', margin, footerY);

        const centerText = "Informe de Resultados - Guía de Estudio - Unidad 1";
        const centerWidth = doc.getStringUnitWidth(centerText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        doc.text(centerText, (pageWidth - centerWidth) / 2, footerY);

        const pageNumStr = `Pág. ${data.pageNumber}`;
        const pageNumWidth = doc.getStringUnitWidth(pageNumStr) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        doc.text(pageNumStr, pageWidth - margin - pageNumWidth, footerY);
      }
    });

    const typeStr = examType === 'final' ? 'Examen_Final' : 'Simulacro';
    doc.save(`Informe_${typeStr}_Unidad1_${userName.replace(/\s+/g, '_')}.pdf`);
  };

  if (score === null) return <div>Cargando resultados...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      <div className="results-header">
        <div style={{ textAlign: 'left' }}>
          <h1 className="text-3xl" style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Resultados Finales de {userName}</h1>
          <p className="text-base text-muted">Aquí tienes un resumen de tu desempeño y recomendaciones.</p>
        </div>

        {examType !== 'final' && (
          <button onClick={handleRetake} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <RotateCcw size={18} /> Volver a Intentar
          </button>
        )}
      </div>

      <div className="results-grid">

        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '200px', height: '200px', marginBottom: '2.5rem' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--surface-hover)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--secondary)"
                strokeWidth="3"
                strokeDasharray={`${score}, 100`}
                style={{ transition: 'stroke-dasharray 1s ease-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <span className="text-3xl" style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>{score.toFixed(0)}%</span>
            </div>
          </div>

          <button onClick={handleDownloadPDF} className="btn" style={{
            background: 'linear-gradient(135deg, var(--primary), #8a1515)',
            color: 'white', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', width: '100%'
          }}>
            <Download size={18} /> Descargar Informe (PDF)
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-ambient)', border: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <CheckCircle color="var(--secondary)" size={24} />
              <h3 className="text-xl" style={{ color: 'var(--text-main)', fontWeight: 600 }}>Temas Sólidos</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {themeStats.filter(t => t.isSolid).length > 0 ? (
                themeStats.filter(t => t.isSolid).map(theme => (
                  <div key={theme.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(var(--secondary-rgb), 0.05)', borderRadius: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{theme.name}</span>
                    <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{theme.percentage.toFixed(0)}%</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">Parece que aún hay espacio para fortalecer todos los ejes. ¡Ánimo!</p>
              )}
            </div>
          </div>

          <div style={{
            background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-ambient)', border: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <AlertTriangle color="#c2652a" size={24} />
              <h3 className="text-xl" style={{ color: 'var(--text-main)', fontWeight: 600 }}>Temas por Fortalecer</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {themeStats.filter(t => !t.isSolid).length > 0 ? (
                themeStats.filter(t => !t.isSolid).map(theme => (
                  <div key={theme.name} style={{ borderLeft: '3px solid #c2652a', paddingLeft: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{theme.name}</span>
                      <span style={{ color: '#c2652a', fontSize: '0.85rem' }}>{theme.percentage.toFixed(0)}% de dominio</span>
                    </div>
                    <p className="text-sm text-muted" style={{ marginBottom: '0.75rem' }}>
                      Te sugiero revisar: <strong>{theme.readings.join(', ')}</strong>.
                    </p>
                    <Link to={theme.path} className="text-sm" style={{
                      color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600
                    }}>
                      Ir al {theme.moduleId === "4" ? "Módulo 4" : `Módulo ${theme.moduleId}`} <ArrowRight size={14} />
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">¡Increíble! No hay debilidades detectadas. Has logrado un dominio total.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
