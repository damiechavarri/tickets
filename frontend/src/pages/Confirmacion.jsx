import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { events } from '../data/events';
import { Header } from '../components/Layout/Header';
import { BotonVolver } from '../components/Shared/BotonVolver';
import QRCode from 'qrcode';

export function Confirmacion() {
  const { eventId } = useParams();
  const { state } = useLocation();
  const [qrCodes, setQrCodes] = useState({});
  const [loading, setLoading] = useState(true);
  
  const { 
    ticketQuantities, 
    totalPrice, 
    customerData, 
    ticketsWithIds,
    purchaseDate,
    orderId 
  } = state || {};

  const event = events[eventId];

  console.log('🔍 State recibido:', state);
  console.log('🔍 Tickets con IDs:', ticketsWithIds);

  // Verificar si hay datos de compra
  useEffect(() => {
    if (!state || !ticketsWithIds) {
      console.log('❌ No hay datos de compra - redirigiendo');
      window.location.href = '/#/';
      return;
    }
  }, [state, ticketsWithIds]);

  // Generar múltiples QRs
  useEffect(() => {
    if (!ticketsWithIds) return;

    const generarMultiplesQRs = async () => {
      setLoading(true);
      const newQrCodes = {};

      try {
        // Contador total de tickets
        let totalTicketsGenerated = 0;

        // Generar QR para cada ticket individual
        for (const [ticketTypeId, ticketData] of Object.entries(ticketsWithIds)) {
          console.log(`🔄 Procesando ${ticketData.quantity} tickets de tipo ${ticketTypeId}`);
          
          for (const ticketId of ticketData.ticketIds) {
            totalTicketsGenerated++;
            const qrData = `TICKET:${ticketId}|EVENT:${eventId}|VALID:1`;
            
            console.log(`📝 Generando QR ${totalTicketsGenerated}: ${ticketId}`);
            
            const qrImageUrl = await QRCode.toDataURL(qrData, {
              width: 150,
              margin: 1,
              color: { dark: '#000000', light: '#FFFFFF' }
            });
            
            newQrCodes[ticketId] = {
              qrImage: qrImageUrl,
              type: ticketData.type,
              id: ticketId
            };
          }
        }

        setQrCodes(newQrCodes);
        setLoading(false);
        console.log(`✅ QR generation complete: ${totalTicketsGenerated} tickets`);
        
      } catch (error) {
        console.error('💥 QR generation error:', error);
        setLoading(false);
      }
    };

    generarMultiplesQRs();
  }, [ticketsWithIds, eventId]);



  // Calcular estadísticas
  const totalTickets = ticketsWithIds ? 
    Object.values(ticketsWithIds).reduce((sum, ticket) => sum + ticket.quantity, 0) : 0;

  const qrCodesGenerated = Object.keys(qrCodes).length;

// Agrega esto DESPUÉS del useEffect que genera los QRs y ANTES del return

// useEffect para enviar email automáticamente
useEffect(() => {
  console.log('🔍 Condiciones para email:');
  console.log('🔍 customerData?.email:', customerData?.email);
  console.log('🔍 loading:', loading);
  console.log('🔍 qrCodesGenerated:', qrCodesGenerated);
  console.log('🔍 totalTickets:', totalTickets);
  console.log('🔍 Se enviará email?:', customerData?.email && !loading && qrCodesGenerated === totalTickets);

  if (customerData?.email && !loading && qrCodesGenerated === totalTickets) {
    console.log('✅ CONDICIONES CUMPLIDAS - Enviando email');
    enviarEmailConfirmacion();
  }
}, [loading, customerData, qrCodesGenerated, totalTickets]);

// Y asegúrate de que esta función esté definida:
const enviarEmailConfirmacion = async () => {
  if (!customerData?.email) return;

  try {
    console.log('📧 Iniciando envío de email...');

    const emailData = {
      to: customerData.email,
      customerName: customerData.nombre,
      eventName: event.name,
      orderId: orderId,
      tickets: Object.entries(ticketsWithIds || {}).map(([ticketTypeId, ticketData]) => ({
        type: ticketData.type,
        quantity: ticketData.quantity
      })),
      ticketsWithIds: ticketsWithIds, // ← AGREGAR ESTO para los IDs individuales
      totalPrice: totalPrice,
      purchaseDate: purchaseDate
    };

    console.log('📧 Datos para email:', emailData);
    console.log('📧 Tickets con IDs:', ticketsWithIds);

    const response = await fetch('/.netlify/functions/send-confirmation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Email enviado correctamente');
    } else {
      console.error('❌ Error enviando email:', result.error);
    }
  } catch (error) {
    console.error('❌ Error enviando email:', error);
  }
};

  if (!event || !state) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Datos de compra no encontrados</h1>
          <p className="text-gray-600 mt-2">Por favor, completa el proceso de compra</p>
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
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <BotonVolver />
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-green-200">
          <div className="bg-green-500 text-white p-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <h1 className="text-3xl font-bold">¡Compra Confirmada!</h1>
            <p className="text-green-100 mt-2">
              {totalTickets} entrada{totalTickets !== 1 ? 's' : ''} - Orden: {orderId}
            </p>
          </div>

          <div className="p-6">
            {/* Debug info */}
            <div className="mb-4 p-3 bg-blue-100 border border-blue-400 rounded">
              <p className="text-sm text-blue-800">
                <strong>Estado:</strong> {loading ? '🔄 Generando QRs...' : '✅ Listo'} | 
                <strong> Tickets:</strong> {totalTickets} | 
                <strong> QRs:</strong> {qrCodesGenerated}/{totalTickets}
              </p>
            </div>

            {/* Información de compra */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">📋 Detalles de Compra</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><strong>Orden:</strong> <code>{orderId}</code></div>
                <div><strong>Cliente:</strong> {customerData?.nombre}</div>
                <div><strong>Email:</strong> {customerData?.email}</div>
                <div><strong>Evento:</strong> {event.name}</div>
                <div><strong>Fecha:</strong> {purchaseDate ? new Date(purchaseDate).toLocaleString('es-ES') : 'Hoy'}</div>
                <div><strong>Total:</strong> ${totalPrice}</div>
              </div>
            </div>

            {/* Tickets y QRs */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">🎫 Tus Entradas</h2>
              
              {Object.entries(ticketsWithIds || {}).map(([ticketTypeId, ticketData]) => (
                <div key={ticketTypeId} className="mb-6 border-b pb-4">
                  <h3 className="text-lg font-semibold mb-3 text-blue-600 bg-blue-50 p-2 rounded">
                    {ticketData.type} × {ticketData.quantity}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {ticketData.ticketIds.map((ticketId, index) => (
                      <div key={ticketId} className="text-center border-2 border-green-200 rounded-lg p-3 bg-white shadow">
                        <p className="text-xs text-gray-600 mb-2 font-mono bg-gray-100 p-1 rounded">
                          #{index + 1} - {ticketData.type}
                        </p>
                        
                        {qrCodes[ticketId] ? (
                          <>
                            <img 
                              src={qrCodes[ticketId].qrImage} 
                              alt={`QR ${ticketId}`}
                              className="w-32 h-32 mx-auto border"
                            />
                            <p className="text-xs text-gray-500 mt-2 font-mono">
                              {ticketId.substring(0, 16)}...
                            </p>
                          </>
                        ) : (
                          <div className="w-32 h-32 bg-gray-200 rounded mx-auto flex items-center justify-center border">
                            <span className="text-gray-500 text-xs">Generando QR...</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Botones */}
            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? '🔄 Generando...' : '🖨️ Imprimir Tickets'}
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