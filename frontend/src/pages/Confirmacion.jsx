import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { events } from '../data/events';
import { Header } from '../components/Layout/Header';
import { BotonVolver } from '../components/Shared/BotonVolver';

const Confirmacion = () => {
  const [loading, setLoading] = useState(true);
  const [emailStatus, setEmailStatus] = useState('enviando');
  const [ventaData, setVentaData] = useState(null);
  const [qrActivo, setQrActivo] = useState(0); // Para navegar entre QRs
  
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const event = events[eventId];

  useEffect(() => {
    const enviarEmailAutomatico = async () => {
      if (!location.state) {
        navigate('/');
        return;
      }

      const { ticketQuantities, totalPrice, customerData, ticketsIndividuales, purchaseDate, orderId } = location.state;
      
      const ventaCompleta = {
        orderId: orderId,
        purchaseDate: purchaseDate,
        evento: event?.name || 'Evento',
        fecha: event?.date || new Date().toLocaleDateString('es-AR'),
        hora: event?.time || '20:00 hs',
        ubicacion: event?.location || 'Ubicación no especificada',
        cantidad: Object.values(ticketQuantities || {}).reduce((sum, qty) => sum + qty, 0),
        total: `$${totalPrice || 0}`,
        cliente: customerData || {
          nombre: 'Cliente',
          email: 'usuario@ejemplo.com',
          telefono: ''
        },
        ticketsIndividuales: ticketsIndividuales || [],
        ticketQuantities: ticketQuantities || {},
        eventId: eventId
      };
      
      setVentaData(ventaCompleta);

console.log('📤 Enviando email con datos:', {
  to: ventaData.cliente.email,
  eventName: ventaData.evento,
  quantity: ventaData.cantidad,
  ticketsCount: ventaData.ticketsIndividuales?.length
});
      // Enviar email automáticamente
      try {
        const response = await fetch('/api/send-confirmation-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: ventaCompleta.cliente.email,
            subject: `✅ Confirmación de Entrada - ${ventaCompleta.evento}`,
            userName: ventaCompleta.cliente.nombre,
            ticketNumber: ventaCompleta.orderId,
            eventName: ventaCompleta.evento,
            eventDate: ventaCompleta.fecha,
            eventTime: ventaCompleta.hora,
            eventLocation: ventaCompleta.ubicacion,
            quantity: ventaCompleta.cantidad,
            totalAmount: ventaCompleta.total,
            tickets: ventaCompleta.ticketsIndividuales, // ← Enviamos tickets individuales
            purchaseDate: ventaCompleta.purchaseDate
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          setEmailStatus('enviado');
        } else {
          setEmailStatus('error');
        }
      } catch (error) {
        setEmailStatus('error');
      } finally {
        setLoading(false);
      }
      console.log('📨 Respuesta email:', result);
    };

    enviarEmailAutomatico();
  }, [location.state, event, eventId, navigate]);

  const generarQR = (ticketId) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketId)}&margin=10&format=png`;
  };

  const handleNextQR = () => {
    if (ventaData && ventaData.ticketsIndividuales) {
      setQrActivo((prev) => (prev + 1) % ventaData.ticketsIndividuales.length);
    }
  };

  const handlePrevQR = () => {
    if (ventaData && ventaData.ticketsIndividuales) {
      setQrActivo((prev) => (prev - 1 + ventaData.ticketsIndividuales.length) % ventaData.ticketsIndividuales.length);
    }
  };

  const handleNewPurchase = () => {
    navigate('/');
  };

  const handleRetryEmail = async () => {
    // ... (mismo código de reintento que antes)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Confirmando tu compra...</p>
          <p className="text-sm text-gray-500 mt-2">Enviando email de confirmación</p>
        </div>
      </div>
    );
  }

  if (!ventaData || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error al cargar la confirmación</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const ticketActual = ventaData.ticketsIndividuales[qrActivo];
  const totalTickets = ventaData.ticketsIndividuales.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header event={event} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BotonVolver />
        
        {/* Header de confirmación */}
        <div className="bg-green-500 text-white rounded-lg p-6 mb-8 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h1 className="text-3xl font-bold mb-2">¡Compra Confirmada!</h1>
          <p className="text-green-100">Tienes {ventaData.cantidad} entrada(s) reservada(s)</p>
          <div className="mt-2 text-sm bg-green-600 inline-block px-3 py-1 rounded-full">
            Orden: {ventaData.orderId}
          </div>
        </div>

        {/* Estado del email */}
        <div className={`mb-6 p-4 rounded-lg text-center ${
          emailStatus === 'enviando' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
          emailStatus === 'enviado' ? 'bg-green-100 text-green-800 border border-green-200' :
          'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {/* ... (mismo código de estados de email) */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Detalles de la compra */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">📋 Detalles de tu compra</h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Evento:</span>
                <span>{ventaData.evento}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Fecha y hora:</span>
                <span>{ventaData.fecha} - {ventaData.hora}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Ubicación:</span>
                <span>{ventaData.ubicacion}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Cliente:</span>
                <span>{ventaData.cliente.nombre}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Email:</span>
                <span>{ventaData.cliente.email}</span>
              </div>
              
              {/* Resumen por tipo de ticket */}
              <div className="mt-4">
                <h3 className="font-semibold mb-2">🎫 Resumen de entradas:</h3>
                {Object.entries(ventaData.ticketQuantities).map(([ticketId, quantity]) => {
                  if (quantity > 0) {
                    const ticket = event.tickets.find(t => t.id === ticketId);
                    return ticket ? (
                      <div key={ticketId} className="flex justify-between text-sm mb-1">
                        <span>{ticket.type} x{quantity}</span>
                        <span>${ticket.price * quantity}</span>
                      </div>
                    ) : null;
                  }
                  return null;
                })}
              </div>
              
              <div className="flex justify-between font-bold text-lg mt-4 pt-3 border-t">
                <span>Total pagado:</span>
                <span className="text-green-600">{ventaData.total}</span>
              </div>
            </div>
          </div>

          {/* Código QR INDIVIDUAL */}
          <div className="bg-white rounded-lg shadow-lg p-6">
  <h2 className="text-xl font-bold mb-4 text-gray-800">🎟️ Tus Entradas ({ventaData.ticketsIndividuales.length})</h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
    {ventaData.ticketsIndividuales.map((ticket, index) => (
      <div key={ticket.id} className="border rounded-lg p-4 text-center">
        <div className="text-sm text-gray-600 mb-2">
          Entrada {index + 1} - <strong>{ticket.type}</strong>
        </div>
        <img 
          src={generarQR(ticket.id)} 
          alt={`Código QR entrada ${index + 1}`} 
          className="mx-auto border-2 border-gray-200 rounded mb-2 w-32 h-32"
        />
        <div className="text-xs text-gray-500 bg-gray-100 p-1 rounded">
          ID: {ticket.id}
        </div>
      </div>
    ))}
  </div>
</div>
        </div>

        {/* Acción principal */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <button 
            onClick={handleNewPurchase}
            className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-200 flex items-center gap-2 mx-auto"
          >
            🏠 Realizar nueva compra
          </button>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-left">
            <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Información importante:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Cada entrada tiene un código QR único e intransferible</li>
              <li>• Llega 30 minutos antes del horario indicado</li>
              <li>• Presenta identificación junto con el código QR</li>
              <li>• Revisa tu email para los detalles completos de todas las entradas</li>
              {totalTickets > 1 && (
                <li>• Debes presentar cada código QR individual para ingresar</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmacion;