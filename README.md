# Guía de Estudio: La Mediación Pedagógica y Estrategias de Trabajo Docente - BENUNE 🎓

<img src="https://benune.github.io/home/images/LogoBENUNE_WhiteCircleBG.png" alt="Logo BENUNE" width="100" height="100">

Esta es una **Progressive Web App (PWA)** diseñada para estudiantes de la Benemérita Escuela Normal Urbana Nocturna (BENUNE). Su objetivo es proporcionar una guía interactiva y estructurada sobre la **Mediación Pedagógica y las Estrategias de Trabajo Docente**, centrándose en la Unidad 1 del curso.

## Características Principales

- **Ruta de Aprendizaje Lineal**: Contenido dosificado en 4 módulos fundamentales que deben completarse secuencialmente.
- **Enfoque en el DUA**: Implementa principios del Diseño Universal para el Aprendizaje, con soporte para Modo Oscuro y ajuste de tamaño de fuente.
- **Seguimiento de Progreso Dinámico**: Barra de avance en tiempo real que se actualiza al superar los mini-tests de cada módulo (mínimo 60% de aciertos).
- **Evaluación Final Inteligente**:
  - Banco de **80 reactivos** seleccionados aleatoriamente.
  - Diagnóstico por fortalezas y áreas por fortalecer.
  - Generación de **Informe de Resultados en PDF** con recomendaciones pedagógicas personalizadas.
- **Experiencia Premium**: Diseño basado en *Glassmorphism*, transiciones fluidas y una interfaz intuitiva y adaptable (Mobile-First).

## Tecnologías Utilizadas

- **Core**: React 18 + Vite + TypeScript.
- **Navegación**: React Router DOM v6.
- **Estado Global**: React Context API.
- **Iconografía**: Lucide React.
- **Documentación**: jsPDF + jspdf-autotable.
- **Estilos**: Vanilla CSS con variables personalizadas (Design System).

## Instalación y Desarrollo

Para ejecutar este proyecto localmente, sigue estos pasos:

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/jesusvasquez/Mediacion-Guia-U1.git
    cd Mediacion-Guia-U1
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Iniciar el servidor de desarrollo**:
    ```bash
    npm run dev
    ```

4.  **Construir para producción**:
    ```bash
    npm run build
    ```

## Estructura del Proyecto

- `src/components`: Componentes reutilizables (Sidebar, Topbar, etc.).
- `src/pages`: Vistas principales (Módulos, Examen, Resultados, Login).
- `src/context`: Manejo del estado centralizado de la aplicación.
- `src/data`: Archivos JSON con los contenidos pedagógicos y reactivos.
- `public/pdfs`: Guías de apuntes descargables.

---

**Institución**: Benemérita Escuela Normal Urbana Nocturna "Ing. José G. Valenzuela" (BENUNE).
**Autor**: Jesús Antonio Vásquez Córdova.
**Gestión Pedagógica**: Unidad 1 - La Mediación Pedagógica
