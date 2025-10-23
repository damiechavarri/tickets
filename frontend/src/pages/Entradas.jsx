import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { events } from '../data/events'
import { Header } from '../components/Layout/Header'
import { BotonVolver } from '../components/Shared/BotonVolver'


function Entradas() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const event = events[eventId]
  
  const [ticketQuantities, setTicketQuantities] = useState({})

  const updateQuantity = (ticketId, quantity) => {
    setTicketQuantities(prev => ({
      ...prev,
      [ticketId]: Math.max(0, quantity)
    }))
  }

  const totalTickets = Object.values(ticketQuantities).reduce((a, b) => a + b, 0)
  const totalPrice = event.tickets.reduce((total, ticket) => {
    return total + (ticketQuantities[ticket.id] || 0) * ticket.price
  }, 0)

  const handleContinue = () => {
    if (totalTickets > 0) {
      navigate(`/cliente/${eventId}`, { 
        state: { ticketQuantities, totalPrice } 
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header event={event} />
      
      <div className="container mx-auto px-4 py-8">
        <BotonVolver/>
        <h2 className="text-2xl font-bold mb-6 text-center">Selecciona tus entradas</h2>
        
        <div className="grid gap-4 max-w-2xl mx-auto">
          {event.tickets.map(ticket => (
            <div key={ticket.id} className="bg-white p-4 md:p-6 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div className="text-center md:text-left">
                  <h3 className="font-semibold text-lg">{ticket.type}</h3>
                  <p className="text-green-600 font-bold">${ticket.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQuantity(ticket.id, (ticketQuantities[ticket.id] || 0) - 1)}
                    className="px-3 py-1 bg-gray-200 rounded text-lg"
                  >
                    -
                  </button>
                  <span className="font-semibold">{ticketQuantities[ticket.id] || 0}</span>
                  <button 
                    onClick={() => updateQuantity(ticket.id, (ticketQuantities[ticket.id] || 0) + 1)}
                    className="px-3 py-1 bg-gray-200 rounded text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalTickets > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
              <div className="text-center md:text-left">
                <p className="font-semibold">{totalTickets} tickets seleccionados</p>
                <p className="text-green-600 font-bold">Total: ${totalPrice}</p>
              </div>
              <button 
                onClick={handleContinue}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold w-full md:w-auto"
              >
                Continuar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Entradas;