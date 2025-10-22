import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { events } from '../data/events'
import { Header } from '../components/Layout/Header'
import { BotonVolver } from '../components/Shared/BotonVolver'

export function Pago() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const event = events[eventId]
  
  const { ticketQuantities, totalPrice, customerData } = location.state || {}

  if (!event) {
    navigate('/')
    return null
  }

  const handlePagoMercadoPago = () => {
  setTimeout(() => {
    // Generar IDs únicos para CADA ticket
    const ticketsWithIds = {};
    
    Object.entries(ticketQuantities || {}).forEach(([ticketTypeId, quantity]) => {
      if (quantity > 0) {
        ticketsWithIds[ticketTypeId] = {
          quantity: quantity,
          // Generar ID único para CADA unidad del mismo tipo
          ticketIds: Array.from({ length: quantity }, (_, i) => 
            `TKT-${Date.now()}-${ticketTypeId}-${i}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
          )
        };
      }
    });

    navigate(`/confirmacion/${eventId}`, { 
      state: { 
        ticketQuantities, 
        totalPrice, 
        customerData,
        ticketsWithIds, // ← Nuevo objeto con IDs individuales
        purchaseDate: new Date().toISOString()
      } 
    });
  }, 2000);
};

  return (
    <div className="min-h-screen bg-gray-50">
      <Header event={event} />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <BotonVolver />
        
        <h2 className="text-2xl font-bold mb-6 text-center">Método de Pago</h2>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-100 p-6">
            <h3 className="font-semibold text-lg mb-4">Resumen de tu compra</h3>
            <div className="space-y-2">
              {Object.entries(ticketQuantities || {}).map(([ticketId, quantity]) => {
                if (quantity > 0) {
                  const ticket = event.tickets.find(t => t.id === ticketId)
                  return ticket ? (
                    <div key={ticketId} className="flex justify-between">
                      <span>{ticket.type} x{quantity}</span>
                      <span>${ticket.price * quantity}</span>
                    </div>
                  ) : null
                }
                return null
              })}
              <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
                <span>Total:</span>
                <span className="text-green-600">${totalPrice || 0}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="font-semibold mb-4">Pagar con Mercado Pago</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6 text-center">
              <div className="text-gray-600 mb-2">
                <span className="font-semibold">Mercado Pago</span>
              </div>
              <div className="text-yellow-500 text-4xl mb-2">💳</div>
              <p className="text-sm text-gray-500">Simulación de pasarela de pago</p>
            </div>
            
            <button 
              onClick={handlePagoMercadoPago}
              className="w-full bg-blue-500 text-white py-4 rounded-lg font-semibold hover:bg-blue-600 transition duration-200 flex items-center justify-center gap-2"
            >
              <span>Pagar con</span>
              <span className="font-bold">Mercado Pago</span>
              <span>${totalPrice || 0}</span>
            </button>

            {/* Información adicional */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">📧 Recibirás por email:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Confirmación de tu compra</li>
                <li>• Código QR único para el evento</li>
                <li>• Detalles de tu reserva</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}