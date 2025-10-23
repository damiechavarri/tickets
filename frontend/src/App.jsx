import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Inicio } from './pages/Inicio'
import { Entradas } from './pages/Entradas'
import { Cliente } from './pages/Cliente'
import { Pago } from './pages/Pago'
import  Confirmacion  from './pages/Confirmacion.jsx';

function App() {
  return (
    <div className="App">
      <Router>  {/* ← Este Router queda */}
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/evento/:eventId" element={<Entradas />} />
          <Route path="/cliente/:eventId" element={<Cliente />} />
          <Route path="/pago/:eventId" element={<Pago />} />
          <Route path="/confirmacion/:eventId" element={<Confirmacion />} />
          <Route path="/confirmacion" element={<Confirmacion />} />
          <Route path="/debug-route/:id" element={
    <div style={{ padding: '40px', background: 'blue', color: 'white' }}>
      <h1>✅ DEBUG ROUTE WORKS!</h1>
      <p>Si ves esto, el routing dinámico funciona</p>
    </div>
  } />
        </Routes>
      </Router>
    </div>
  )
}

export default App