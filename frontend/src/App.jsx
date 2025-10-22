import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Inicio } from './pages/Inicio'
import { Entradas } from './pages/Entradas'
import { Cliente } from './pages/Cliente'
import { Pago } from './pages/Pago'
import { Confirmacion } from './pages/Confirmacion.jsx';

function App() {
  return (
    <div className="App">
      {/* ✅ AGREGAR Router */}
      <Router>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/evento/:eventId" element={<Entradas />} />
          <Route path="/cliente/:eventId" element={<Cliente />} />
          <Route path="/pago/:eventId" element={<Pago />} />
          
          {/* ✅ AGREGAR ruta dinámica */}
          <Route path="/confirmacion/:eventId" element={<Confirmacion />} />
          <Route path="/confirmacion" element={<Confirmacion />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App