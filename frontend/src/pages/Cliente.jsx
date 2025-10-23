import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { events } from '../data/events'
import { Header } from '../components/Layout/Header'
import { BotonVolver } from '../components/Shared/BotonVolver'

function Cliente() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const event = events[eventId]
  
  const { ticketQuantities, totalPrice } = location.state || {}
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

 // En Cliente.jsx - Correcto
const handleSubmit = (e) => {
  e.preventDefault()
  navigate(`/pago/${eventId}`, { 
    state: { ticketQuantities, totalPrice, customerData: formData } 
  })
}

  return (
    <div className="min-h-screen bg-gray-50">
      <Header event={event} />
      
      <div className="container mx-auto px-4 py-8 max-w-md">
        <BotonVolver/>
        <h2 className="text-2xl font-bold mb-6 text-center">Datos del Comprador</h2>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Apellido</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Continuar al Pago
          </button>
        </form>
      </div>
    </div>
  )
}

export default Cliente;