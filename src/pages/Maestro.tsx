import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Users, Search, FileText, Calendar, TrendingUp, Download, Eye, Trash2, FileSpreadsheet } from 'lucide-react';

interface StudentResult extends DocumentData {
  id: string;
  estudiante: string;
  email: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timestamp: any;
  type: string;
  history: any[];
}

const LOGO_URL = "https://benune.github.io/home/images/LogoBENUNE_WhiteCircleBG.png";

export default function Maestro() {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);

  useEffect(() => {
    const q = query(collection(db, "resultados"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudentResult[];
      setResults(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching results: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredResults = [...results]
    .filter(r => 
      r.estudiante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.estudiante.localeCompare(b.estudiante));

  const averageScore = results.length > 0 
    ? results.reduce((acc, curr) => acc + curr.score, 0) / results.length 
    : 0;

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este registro permanentemente?')) return;
    
    try {
      await deleteDoc(doc(db, "resultados", id));
      if (selectedStudent?.id === id) setSelectedStudent(null);
    } catch (e) {
      console.error("Error deleting document: ", e);
      alert("Error al eliminar el registro.");
    }
  };

  const getBase64ImageFromURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = error => reject(error);
      img.src = url;
    });
  };

  const handleDownloadStudentPDF = async (student: StudentResult) => {
    const doc = new jsPDF();
    const { estudiante, score, timestamp, type, history } = student;
    const dateStr = timestamp?.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) || 'N/A';

    // Header Background
    doc.setFillColor(86, 12, 12);
    doc.rect(0, 0, 210, 40, 'F');

    // Add Logo
    try {
      const logoData = await getBase64ImageFromURL(LOGO_URL);
      doc.addImage(logoData, 'PNG', 12, 5, 30, 30);
    } catch (e) {
      console.warn("Could not load logo for PDF", e);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18); // Reduced from 22
    doc.setFont("helvetica", "bold");
    doc.text("REPORTE DE EVALUACIÓN - DOCENTE", 50, 20); // Aligned with logo
    doc.setFontSize(8); // Reduced from 10
    doc.setFont("helvetica", "normal");
    doc.text("Benemérita Escuela Normal Urbana Nocturna del Estado - BENUNE", 50, 28);

    // Info Section
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10); // Reduced from 12
    doc.text(`Estudiante: ${estudiante}`, 20, 55);
    doc.text(`Correo: ${student.email}`, 20, 61);
    doc.text(`Fecha: ${dateStr}`, 20, 67);
    doc.text(`Tipo: ${type === 'final' ? 'Examen Final' : 'Simulador'}`, 20, 73);

    // Score Box
    doc.setDrawColor(86, 12, 12);
    doc.setLineWidth(0.5);
    doc.roundedRect(140, 50, 50, 25, 2, 2);
    doc.setFontSize(8); // Reduced from 10
    doc.text("CALIFICACIÓN", 165, 57, { align: 'center' });
    doc.setFontSize(20); // Reduced from 24
    doc.text(`${score.toFixed(0)}%`, 165, 70, { align: 'center' });

    // Table
    const tableData = history.map((h, i) => [
      i + 1,
      h.preguntaId || 'N/A',
      h.respuesta,
      h.esCorrecta ? 'CORRECTO' : 'INCORRECTO'
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['#', 'ID Reactivo', 'Respuesta del Alumno', 'Resultado']],
      body: tableData,
      headStyles: { fillColor: [86, 12, 12], fontSize: 8 },
      bodyStyles: { fontSize: 8 }, // Consistent with 8pt request
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 25 },
        3: { cellWidth: 30 }
      }
    });

    doc.save(`Reporte_Maestro_${estudiante.replace(/\s+/g, '_')}.pdf`);
  };

  const handleDownloadGroupReport = async () => {
    const doc = new jsPDF();
    const now = new Date().toLocaleString();

    // Group Statistics
    const finalExams = results.filter(r => r.type === 'final');
    const passed = finalExams.filter(r => r.score >= 60).length;

    // Header Background
    doc.setFillColor(26, 71, 42); // Green for group report
    doc.rect(0, 0, 210, 40, 'F');

    // Add Logo
    try {
      const logoData = await getBase64ImageFromURL(LOGO_URL);
      doc.addImage(logoData, 'PNG', 12, 5, 30, 30);
    } catch (e) {
      console.warn("Could not load logo for PDF", e);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18); // Reduced from 22
    doc.text("INFORME GRUPAL DE RESULTADOS", 50, 20);
    doc.setFontSize(8); // Reduced from 10
    doc.text(`Generado el: ${now}`, 50, 28);

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12); // Reduced from 14
    doc.setFont("helvetica", "bold");
    doc.text("Estadísticas Generales", 20, 55);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8); // Reduced from 10
    doc.text(`Total de registros: ${results.length}`, 20, 63);
    doc.text(`Promedio Grupal: ${averageScore.toFixed(1)}%`, 20, 69);
    doc.text(`Exámenes Finales: ${finalExams.length}`, 20, 75);
    doc.text(`Porcentaje de Aprobación: ${finalExams.length > 0 ? ((passed / finalExams.length) * 100).toFixed(1) : 0}%`, 20, 81);

    // Main Table
    const tableData = [...results]
      .sort((a, b) => a.estudiante.localeCompare(b.estudiante))
      .map(r => [
        r.estudiante,
        r.email,
        r.type === 'final' ? 'Examen' : 'Sim.',
        `${r.score.toFixed(0)}%`,
        r.timestamp?.toDate().toLocaleDateString() || 'N/A'
      ]);

    autoTable(doc, {
      startY: 90,
      head: [['Estudiante', 'Correo Electrónico', 'Tipo', 'Calif.', 'Fecha']],
      body: tableData,
      headStyles: { fillColor: [26, 71, 42], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 20, right: 20 }
    });

    doc.save(`Reporte_Grupal_Unidad1.pdf`);
  };

  const handleDownloadCSV = () => {
    const headers = ["Estudiante", "Email", "Tipo", "Calificacion", "Respuestas_Correctas", "Fecha"];
    const rows = results.map(r => [
      `"${r.estudiante}"`,
      r.email,
      r.type,
      r.score,
      r.correctAnswers,
      r.timestamp?.toDate().toISOString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Resultados_Unidad1.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Cargando tablero docente...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header with Export Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
        <div>
          <h1 className="text-3xl" style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Tablero del Maestro</h1>
          <p className="text-muted">Gestión de resultados y analítica del grupo.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleDownloadGroupReport} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--secondary)', color: 'white' }}>
            <Download size={18} /> Reporte PDF Grupal
          </button>
          <button onClick={handleDownloadCSV} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet size={18} /> Exportar Excel/CSV
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '12px' }}>
            <Users color="var(--primary)" />
          </div>
          <div>
            <p className="text-xs text-muted" style={{ fontWeight: 600 }}>Total Estudiantes</p>
            <h3 className="text-2xl" style={{ color: 'var(--text-main)', fontWeight: 700 }}>{results.length}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--secondary-light)', padding: '0.75rem', borderRadius: '12px' }}>
            <TrendingUp color="var(--secondary)" />
          </div>
          <div>
            <p className="text-xs text-muted" style={{ fontWeight: 600 }}>Promedio Grupal</p>
            <h3 className="text-2xl" style={{ color: 'var(--text-main)', fontWeight: 700 }}>{averageScore.toFixed(1)}%</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#e6f4ea', padding: '0.75rem', borderRadius: '12px' }}>
            <FileText color="#34a853" />
          </div>
          <div>
            <p className="text-xs text-muted" style={{ fontWeight: 600 }}>Exámenes Finalizados</p>
            <h3 className="text-2xl" style={{ color: 'var(--text-main)', fontWeight: 700 }}>{results.filter(r => r.type === 'final').length}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) 2fr', gap: '2rem', minHeight: '600px' }}>
        
        {/* Student List */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="Buscar estudiante..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', 
                borderRadius: '8px', border: '1px solid var(--border-light)',
                background: 'var(--surface-hover)'
              }}
            />
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredResults.map(res => (
              <div 
                key={res.id} 
                onClick={() => setSelectedStudent(res)}
                style={{ 
                  padding: '1rem', borderRadius: '8px', cursor: 'pointer',
                  background: selectedStudent?.id === res.id ? 'var(--primary-light)' : 'transparent',
                  border: `1px solid ${selectedStudent?.id === res.id ? 'var(--primary)' : 'transparent'}`,
                  transition: 'all 0.2s ease',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{res.estudiante}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{res.email}</p>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: res.score >= 80 ? '#34a853' : res.score >= 60 ? '#c2652a' : '#ea4335' }}>
                      {res.score.toFixed(0)}%
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{res.type === 'final' ? 'Examen' : 'Simul.'}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(res.id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#ea4335', opacity: 0.6 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed View */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          {selectedStudent ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h2 className="text-2xl" style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedStudent.estudiante}</h2>
                  <p className="text-sm text-muted">{selectedStudent.email}</p>
                </div>
                <div style={{ padding: '0.5rem 1rem', background: 'var(--primary-light)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                  ID: {selectedStudent.id.substring(0, 8)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1.5rem', background: 'var(--surface-hover)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Calendar size={16} color="var(--text-muted)" />
                    <span className="text-xs text-muted" style={{ fontWeight: 600 }}>Fecha de Realización</span>
                  </div>
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>
                    {selectedStudent.timestamp?.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div style={{ padding: '1.5rem', background: 'var(--surface-hover)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Eye size={16} color="var(--text-muted)" />
                    <span className="text-xs text-muted" style={{ fontWeight: 600 }}>Aciertos Totales</span>
                  </div>
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>
                    {selectedStudent.correctAnswers} de {selectedStudent.totalQuestions} reactivos
                  </p>
                </div>
              </div>

              <h4 className="text-lg" style={{ marginBottom: '1rem', fontWeight: 600 }}>Detalle de Reactivos</h4>
              <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead style={{ background: 'var(--surface-hover)', textAlign: 'left' }}>
                    <tr>
                      <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>Reactivo</th>
                      <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudent.history?.map((h: any, idx: number) => (
                      <tr key={idx}>
                        <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-light)', maxWidth: '300px' }}>
                          <span style={{ fontWeight: 600 }}>Q{h.preguntaId}: </span> 
                          {h.respuesta}
                        </td>
                        <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                          <span style={{ 
                            padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700,
                            background: h.esCorrecta ? '#e6f4ea' : '#fce8e6',
                            color: h.esCorrecta ? '#34a853' : '#ea4335'
                          }}>
                            {h.esCorrecta ? 'CORRECTO' : 'INCORRECTO'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => handleDownloadStudentPDF(selectedStudent)}
                  className="btn btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', background: 'var(--primary)', color: 'white' }}
                >
                  <Download size={16} /> Descargar Registro
                </button>
                <button 
                  onClick={() => handleDelete(selectedStudent.id)}
                  className="btn" 
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem',
                    background: '#fce8e6', color: '#ea4335', border: '1px solid #f5c2c7'
                  }}
                >
                  <Trash2 size={16} /> Eliminar Registro
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
              <Users size={64} style={{ marginBottom: '1rem' }} />
              <p>Selecciona un estudiante para ver el reporte detallado</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
