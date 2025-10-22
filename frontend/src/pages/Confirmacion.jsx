import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { events } from '../data/events';
import { Header } from '../components/Layout/Header';
import { BotonVolver } from '../components/Shared/BotonVolver';
import QRCode from 'qrcode';

export function Confirmacion() {
  const { eventId } = useParams();
  const { state } = useLocation();
  const [qrCodes, setQrCodes] = useState({}); // Objeto para múltiples QRs
  
  const { 
    ticketQuantities, 
    totalPrice, 
    customerData, 
    ticketsWithIds,
    purchaseDate 
  } = state || {};

  const event = events[eventId];

  // Generar múltiples QRs
  useEffect(() => {
    const generarMultiplesQRs = async () => {
      if (!ticketsWithIds) {
        console.log('❌ No tickets data available');
        return;
      }

      const newQrCodes = {};

      try {
        // Generar QR para cada ticket individual
        for (const [ticketTypeId, ticketData] of Object.entries(ticketsWithIds)) {
          const ticketType = event.tickets.find(t => t.id === ticketTypeId)?.type || ticketTypeId;
          
          for (const ticketId of ticketData.ticketIds) {
            const qrData = `TICKET:${ticketId}|EVENT:${eventId}|TYPE:${ticketType}`;
            const qrImageUrl = await QRCode.toDataURL(qrData, {
              width: 150, // Más pequeño para múltiples
              margin: 1,
              color: { dark: '#000000', light: '#FFFFFF' }
            });
            
            newQrCodes[ticketId] = {
              qrImage: qrImageUrl,
              type: ticketType,
              id: ticketId
            };
          }
        }

        setQrCodes(newQrCodes);
        console.log(`✅ Generated ${Object.keys(newQrCodes).length} QR codes`);
        
      } catch (error) {
        console.error('💥 QR generation error:', error);
      }
    };

    generarMultiplesQRs();
  }, [ticketsWithIds, eventId, event]);

  // Calcular total de tickets
  const totalTickets = ticketsWithIds ? 
    Object.values(ticketsWithIds).reduce((sum, ticket) => sum + ticket.quantity, 0) : 0;

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Evento no encontrado</h1>
          <button 
            onClick={() => window.location.href = '/#/'}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header event={event} />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl"> {/* Más ancho */}
        <BotonVolver />
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-green-200">
          <div className="bg-green-500 text-white p-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <h1 className="text-3xl font-bold">¡Pago Confirmado!</h1>
            <p className="text-green-100 mt-2">
              {totalTickets} ticket{totalTickets !== 1 ? 's' : ''} reservado{totalTickets !== 1 ? 's' : ''} exitosamente
            </p>
          </div>

          <div className="p-6">
            {/* Información del comprador */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">📋 Información de Compra</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Nombre:</strong> {customerData?.nombre}</div>
                <div><strong>Email:</strong> {customerData?.email}</div>
                <div><strong>Evento:</strong> {event.name}</div>
                <div><strong>Fecha:</strong> {purchaseDate ? new Date(purchaseDate).toLocaleString('es-ES') : 'Hoy'}</div>
                <div><strong>Total Tickets:</strong> {totalTickets}</div>
                <div><strong>ID de Compra:</strong> <code className="bg-yellow-100 px-1">ORD-{Date.now()}</code></div>
              </div>
            </div>

            {/* QRs por Ticket */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">🎫 Tus Tickets y Códigos QR</h2>
              
              {Object.entries(ticketsWithIds || {}).map(([ticketTypeId, ticketData]) => {
                const ticketType = event.tickets.find(t => t.id === ticketTypeId)?.type || ticketTypeId;
                
                return (
                  <div key={ticketTypeId} className="mb-6 border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3 text-blue-600">
                      {ticketType} × {ticketData.quantity}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {ticketData.ticketIds.map((ticketId, index) => (
                        <div key={ticketId} className="text-center border rounded-lg p-3 bg-white shadow-sm">
                          <p className="text-xs text-gray-600 mb-2 font-mono">
                            Ticket #{index + 1}
                          </p>
                          
                          {qrCodes[ticketId] ? (
                            <img 
                              src={qrCodes[ticketId].qrImage} 
                              alt={`QR para ${ticketType}`}
                              className="w-32 h-32 mx-auto"
                            />
                          ) : (
                            <div className="w-32 h-32 bg-gray-200 rounded mx-auto flex items-center justify-center">
                              <span className="text-gray-500 text-xs">Generando...</span>
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-500 mt-2 break-words">
                            ID: {ticketId.substring(0, 12)}...
                          </p>
                          <p className="text-xs font-medium mt-1">{ticketType}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumen de compra */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">💰 Resumen de Compra</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {Object.entries(ticketQuantities || {}).map(([ticketId, quantity]) => {
                  if (quantity > 0) {
                    const ticket = event.tickets.find(t => t.id === ticketId);
                    return ticket ? (
                      <div key={ticketId} className="flex justify-between py-2 border-b">
                        <span>{ticket.type} × {quantity}</span>
                        <span>${ticket.price * quantity}</span>
                      </div>
                    ) : null;
                  }
                  return null;
                })}
                <div className="flex justify-between font-bold text-lg pt-2 border-t-2">
                  <span>TOTAL:</span>
                  <span className="text-green-600">${totalPrice || 0}</span>
                </div>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">📝 Importante:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• <strong>Cada ticket necesita su propio código QR</strong> para entrar</li>
                <li>• Presenta el QR correspondiente a cada persona</li>
                <li>• Los códigos QR son únicos e intransferibles</li>
                <li>• Llega 30 minutos antes del evento</li>
              </ul>
            </div>

            {/* Botones */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
              >
                🖨️ Imprimir Todos los Tickets
              </button>
              <button 
                onClick={() => window.location.href = '/#/'}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600"
              >
                🏠 Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}