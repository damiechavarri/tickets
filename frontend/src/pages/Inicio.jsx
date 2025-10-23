import { useNavigate } from 'react-router-dom'
import { events } from '../data/events'

function Inicio() {
  const navigate = useNavigate()
  const event = events.evento1

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner con imagen desde events.js */}
      <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${event.image})` }}
      >
        {/* Overlay oscuro para mejor legibilidad */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        {/* Contenido centrado */}
        <div className="text-center px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">{event.name}</h1>
          <h6 className="text-2xl md:text-3xl font-bold mb-6 text-white">{event.info}</h6>
          <p className="text-xl md:text-2xl mb-4 text-white">{event.date} • {event.time}</p>
          <p className="text-blue-200 text-lg md:text-xl mb-8">{event.location}</p>

          
          <button 
            onClick={() => navigate(`/evento/${event.id}`)}
            className="bg-indigo-500 text-white px-8 py-4 rounded-lg font-semibold text-xl hover:bg-green-600 transition duration-200"
          >
            Comprar Entradas
          </button>
        </div>
      </div>
    </div>
  )
}

export default Inicio;