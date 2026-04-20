import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Layouts & Pages
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Module from './pages/Module';
import Exam from './pages/Exam';
import FinalExam from './pages/FinalExam';
import Results from './pages/Results';
import Bibliography from './pages/Bibliography';
import Maestro from './pages/Maestro';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route element={<MainLayout />}>
            <Route path="/modulo/:id" element={<Module />} />
            <Route path="/evaluacion" element={<Exam />} />
            <Route path="/examen-final" element={<FinalExam />} />
            <Route path="/resultados" element={<Results />} />
            <Route path="/bibliografia" element={<Bibliography />} />
            <Route path="/maestro" element={<Maestro />} />
            <Route path="/dashboard" element={<Navigate to="/modulo/1" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
