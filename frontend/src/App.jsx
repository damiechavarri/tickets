import { Routes, Route } from 'react-router-dom'
import { Inicio } from './pages/Inicio'
import { Entradas } from './pages/Entradas'
import { Cliente } from './pages/Cliente'
import { Pago } from './pages/Pago'
import { Confirmacion } from './pages/Confirmacion'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/evento/:eventId" element={<Entradas />} />
        <Route path="/cliente/:eventId" element={<Cliente />} />
        <Route path="/pago/:eventId" element={<Pago />} />
        <Route path="/confirmacion/:eventId" element={<Confirmacion />} />
      </Routes>
    </div>
  )
}

export default App