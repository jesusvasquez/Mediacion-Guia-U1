import React, { useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';

export default function Bibliography() {
  const [searchTerm, setSearchTerm] = useState('');

  const references = [
    {
      "id": 1,
      "apa": "Alba-Pastor, C., Sánchez Serrano, J. M., & Zubillaga del Río, A. (2011). Diseño Universal para el Aprendizaje (DUA). Pautas para su introducción en el currículo.",
      "description": "Este documento explica los fundamentos neurocientíficos del DUA, detallando las redes cerebrales (reconocimiento, estratégicas y afectivas) y cómo los recursos digitales ofrecen flexibilidad para atender la diversidad.",
      "importancia": "Proporciona el marco práctico para eliminar barreras en el aprendizaje mediante el uso activo de las TIC y la flexibilidad curricular.",
      "trascendencia": "Fundamental para el Módulo 2 de la guía, donde se aborda la accesibilidad y la personalización del aprendizaje desde la neurociencia.",
      "pdfName": "Alba_Pastor_DUA.pdf"
    },
    {
      "id": 2,
      "apa": "Alzate-Ortiz, F. A., & Castañeda-Patiño, J. C. (2020). Mediación pedagógica: Clave de una educación humanizante y transformadora. Revista Electrónica Educare, 24(1), 1-14.",
      "description": "Propone un análisis de la mediación pedagógica desde la estética y la comunicación, buscando re-significar los modelos tradicionales transmisionistas.",
      "importancia": "Enfatiza que la educación debe ser una experiencia sensible, emotiva y revitalizante, basada en el encuentro humano y la empatía.",
      "trascendencia": "Aporta la visión humanista y estética para el Módulo 3 sobre mediación, centrando el proceso en la formación de la vida.",
      "pdfName": "Alzate_Mediacion_Pedagogica.pdf"
    },
    {
      "id": 3,
      "apa": "Ausubel, D., Novak, J., & Hanesian, H. (1983). Psicología educativa: Un punto de vista cognoscitivo. México: Trillas.",
      "description": "Define el aprendizaje significativo como el proceso donde el alumno relaciona la nueva información de forma sustancial y no arbitraria con sus conocimientos previos.",
      "importancia": "Introduce conceptos clave como el 'anclaje', los organizadores previos y la diferenciación entre aprendizaje mecánico y significativo.",
      "trascendencia": "Eje central del Módulo 1, estableciendo los requisitos de significatividad lógica y psicológica para la educación superior.",
      "pdfName": "Ausubel_Psicologia_Educativa.pdf"
    },
    {
      "id": 4,
      "apa": "Bodrova, E., & Leong, D. J. (2004). Herramientas de la mente: El aprendizaje en la infancia desde la perspectiva de Vygotsky. Capítulo 7: El uso de mediadores. México: SEP.",
      "description": "Se centra en el uso práctico de mediadores exteriores y tácticas de andamiaje para desarrollar funciones ejecutivas y memoria deliberada.",
      "importancia": "Ofrece ejemplos tácticos de cómo instrumentos (mapas o marcadores) ayudan al estudiante a actuar con independencia.",
      "trascendencia": "Proporciona las herramientas prácticas para el Módulo 3, ilustrando cómo se implementa el andamiaje en el aula.",
      "pdfName": "Bodrova_Uso_de_Mediadores.pdf"
    },
    {
      "id": 5,
      "apa": "Cortez Quezada, M., & Maira Salcedo, M. P. (2019). Cuadernillo técnico de evaluación educativa 6. Desarrollo de instrumentos de evaluación: Pautas de observación. México: INEE.",
      "description": "Guía técnica para la construcción de instrumentos de evaluación basados en la observación directa de desempeños en el aula.",
      "importancia": "Detalla los pasos para definir indicadores y la importancia de una retroalimentación específica, práctica y enfocada en la mejora.",
      "trascendencia": "Sustenta metodológicamente la sección de Evaluación y el diseño de la Pauta de Observación y la retroalimentación de la aplicación, esenciales para el Módulo 4.",
      "pdfName": "Cortez_Salcedo_Evaluacion_6.pdf"
    },
    {
      "id": 6,
      "apa": "Gómez Arellano, M. G., Olvera Oliveros, M. G., & Aguila Pastrana, G. (2023). Reuven Feuerstein y la mediación. México: ENE.",
      "description": "Presenta la Teoría de la Modificabilidad Cognoscitiva Estructural y los parámetros de la Experiencia de Aprendizaje Mediado (EAM).",
      "importancia": "Analiza las funciones cognitivas y las operaciones mentales necesarias para que el organismo sea un sistema abierto al cambio.",
      "trascendencia": "Esencial para el Módulo 3, definiendo los criterios de intencionalidad, trascendencia y significado en la mediación.",
      "pdfName": "Gomez_Feuerstein_Mediacion.pdf"
    },
    /*     {
          "id": 7,
          "apa": "Programa ECBI (2015). Pauta de observación y acompañamiento docente en el aula. Chile: Universidad de Chile.",
          "description": "Instrumento práctico para evaluar la organización de la clase, el ambiente de aula y la mediación de aprendizajes indagatorios.",
          "importancia": "Ofrece indicadores claros sobre cómo el docente responde constructivamente al error y promueve la participación activa.",
          "trascendencia": "Sirve como referencia para los reactivos del examen final relacionados con la práctica docente y la gestión del aprendizaje.",
          "pdfName": "ECBI_Pauta_Observacion.pdf"
        }, */
    {
      "id": 7,
      "apa": "Reyes García, H. J. (2016). Estrategias didácticas implementadas por los docentes en la mediación pedagógica para el aprendizaje significativo. Nicaragua: UNAN-Managua.",
      "description": "Investigación que vincula las estrategias de enseñanza con la mediación pedagógica y el logro de aprendizajes significativos.",
      "importancia": "Destaca la necesidad de que el docente actúe como mediador que facilita la construcción de conocimientos y el autoaprendizaje.",
      "trascendencia": "Integra los tres grandes temas de la unidad, demostrando su aplicación conjunta en el entorno escolar.",
      "pdfName": "Reyes_Estrategias_Mediacion.pdf"
    },
    {
      "id": 8,
      "apa": "Torres, A. (2023). La mediación pedagógica. Apuntes pedagógicos. Milenio.",
      "description": "El autor analiza la mediación como un proceso de 'tender puentes' entre lo conocido y lo desconocido, subrayando la necesidad de que el docente interpele su propia tradición práctica para adaptarse a los campos formativos y ejes articuladores actuales.",
      "importancia": "Resalta la integración del conocimiento frente a la segmentación disciplinaria y el papel del docente como un mediador ético-político que humaniza la transmisión cultural en la era digital.",
      "trascendencia": "Esencial para contextualizar la Unidad I dentro de la realidad escolar mexicana contemporánea (programas sintéticos y analíticos) y la práctica situada.",
      "pdfName": "Torres_Mediacion_Pedagogica_2023.pdf"
    },
    {
      "id": 9,
      "apa": "Yépez Abreu, M. A. (2011). Aproximación a la comprensión del Aprendizaje Significativo de David Ausubel. Revista Ciencias de la Educación, 21(37), 43-54.",
      "description": "Ensayo reflexivo sobre la naturaleza del constructivismo y la importancia de conocer la estructura cognitiva previa del estudiante.",
      "importancia": "Resalta el papel de los mapas conceptuales y organizadores previos como puentes cognitivos eficaces.",
      "trascendencia": "Refuerza los conceptos del Módulo 1 sobre la importancia de enseñar a pensar a partir de lo que el alumno ya sabe.",
      "pdfName": "Yepez_Aprendizaje_Significativo.pdf"
    }
  ];

  const filtered = references.filter(r => r.apa.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h1 className="text-3xl" style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Bibliografía y Recursos</h1>
          <p className="text-base text-muted">Fuentes especializadas ordenadas alfabéticamente.</p>
        </div>

        <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', borderRadius: '20px', width: '300px' }}>
          <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
          <input
            type="text"
            placeholder="Buscar autor o título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      <div className="flex-col" style={{ gap: '2rem' }}>
        {filtered.map(ref => (
          <div key={ref.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <p className="text-lg" style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem', lineHeight: 1.5 }}>
                {ref.apa}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
                {ref.description}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text-main)' }}>Importancia:</strong> {ref.importancia}
              </p>
              <p className="text-sm" style={{ color: 'var(--secondary)', fontWeight: 500, background: 'var(--secondary-light)', display: 'inline-block', padding: '0.5rem 1rem', borderRadius: 'var(--border-radius)' }}>
                <strong>Trascendencia en Unidad I:</strong> {ref.trascendencia}
              </p>
            </div>

            <a
              href={`/pdfs/${ref.pdfName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', textDecoration: 'none' }}
            >
              <ExternalLink size={16} /> Abrir PDF
            </a>
          </div>
        ))}
      </div>

    </div>
  );
}
