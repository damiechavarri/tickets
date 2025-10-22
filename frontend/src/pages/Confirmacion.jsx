import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { events } from '../data/events';
import { Header } from '../components/Layout/Header';
import { BotonVolver } from '../components/Shared/BotonVolver';

export function Confirmacion() {
  const { eventId } = useParams();
  const { state } = useLocation();
  const [qrCode, setQrCode] = useState('');
  
  const { 
    ticketQuantities, 
    totalPrice, 
    customerData, 
    ticketId,
    purchaseDate 
  } = state || {};

  const event = events[eventId];

  // Generar QR único
  useEffect(() => {
    const generarQR = async () => {
      if (ticketId) {
        try {
          // Importación dinámica de qrcode para evitar errores en build
          const QRCode = await import('qrcode');
          // URL de verificación única
          const verificationUrl = `https://ticketspiramide.netlify.app/#/verificar/${ticketId}`;
          const qrDataURL = await QRCode.default.toDataURL(verificationUrl);
          setQrCode(qrDataURL);
        } catch (error) {
          console.error('Error generando QR:', error);
        }
      }
    };

    generarQR();
  }, [ticketId]);

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
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BotonVolver />
        
        {/* Tarjeta de confirmación */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-green-200">
          {/* Header de éxito */}
          <div className="bg-green-500 text-white p-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <h1 className="text-3xl font-bold">¡Pago Confirmado!</h1>
            <p className="text-green-100 mt-2">Tu reserva ha sido procesada exitosamente</p>
          </div>

          <div className="p-6">
            {/* Información del comprador */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">📋 Información de la Compra</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Nombre:</span>
                    <span>{customerData?.nombre || 'No especificado'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Email:</span>
                    <span>{customerData?.email || 'No especificado'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Ticket ID:</span>
                    <span className="font-mono text-blue-600">{ticketId || 'Generando...'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Fecha de compra:</span>
                    <span>{purchaseDate ? new Date(purchaseDate).toLocaleDateString('es-ES') : 'Hoy'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Evento:</span>
                    <span className="text-right">{event.name}</span>
                  </div>
                </div>
              </div>

              {/* Código QR */}
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">🎫 Tu Código QR</h3>
                {qrCode ? (
                  <div className="inline-block p-4 bg-white border-2 border-green-300 rounded-lg shadow-md">
                    <img 
                      src={qrCode} 
                      alt="Código QR del ticket" 
                      className="w-48 h-48 mx-auto"
                    />
                    <p className="text-sm text-gray-600 mt-3 max-w-xs">
                      <strong>Presenta este código QR en la entrada del evento</strong>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {ticketId}
                    </p>
                  </div>
                ) : (
                  <div className="inline-block p-8 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="animate-pulse text-gray-500">
                      <div className="w-48 h-48 bg-gray-300 rounded mx-auto"></div>
                      <p className="mt-3">Generando código QR...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Resumen de compra */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">💰 Resumen de tu compra</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {Object.entries(ticketQuantities || {}).map(([ticketId, quantity]) => {
                    if (quantity > 0) {
                      const ticket = event.tickets.find(t => t.id === ticketId);
                      return ticket ? (
                        <div key={ticketId} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <span className="font-medium">{ticket.type}</span>
                            <span className="text-gray-600 ml-2">x{quantity}</span>
                          </div>
                          <span className="font-semibold">${ticket.price * quantity}</span>
                        </div>
                      ) : null;
                    }
                    return null;
                  })}
                  <div className="flex justify-between items-center pt-2 border-t-2 border-green-500">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-lg font-bold text-green-600">${totalPrice || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">📝 Instrucciones importantes:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Guarda este comprobante</strong> - Es tu confirmación de compra</li>
                <li>• <strong>Presenta el código QR</strong> en la entrada del evento</li>
                <li>• <strong>Llega 30 minutos antes</strong> del horario del evento</li>
                <li>• <strong>Trae identificación</strong> que coincida con el nombre de la reserva</li>
              </ul>
            </div>

            {/* Botones de acción */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-200 flex items-center justify-center gap-2"
              >
                🖨️ Imprimir Confirmación
              </button>
              <button 
                onClick={() => window.location.href = '/#/'}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition duration-200 flex items-center justify-center gap-2"
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