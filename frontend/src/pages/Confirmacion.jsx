import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { events } from '../data/events';
import { Header } from '../components/Layout/Header';
import { BotonVolver } from '../components/Shared/BotonVolver';

const Confirmacion = () => {
  const [loading, setLoading] = useState(true); // Cambio: loading inicial true
  const [emailStatus, setEmailStatus] = useState('enviando'); // 'enviando', 'enviado', 'error'
  const [ventaData, setVentaData] = useState(null);
  
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const event = events[eventId];

  // Efecto para enviar email automáticamente al cargar
  useEffect(() => {
    const enviarEmailAutomatico = async () => {
      if (!location.state) {
        navigate('/');
        return;
      }

      const { ticketQuantities, totalPrice, customerData, ticketsWithIds, purchaseDate, orderId } = location.state;
      
      // Construir objeto completo de venta
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
        tickets: ticketsWithIds || {},
        ticketQuantities: ticketQuantities || {},
        eventId: eventId
      };
      
      setVentaData(ventaCompleta);

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
            tickets: ventaCompleta.tickets,
            purchaseDate: ventaCompleta.purchaseDate,
            qrData: ventaCompleta.orderId
          }),
        });
        
        const result = await response.json();
        console.log('📧 Respuesta de API email:', result);
        
        if (result.success) {
          setEmailStatus('enviado');
          console.log('✅ Email enviado automáticamente');
        } else {
          setEmailStatus('error');
          console.error('❌ Error enviando email:', result.error);
        }
      } catch (error) {
        console.error('Error llamando a la API:', error);
        setEmailStatus('error');
      } finally {
        setLoading(false);
      }
    };

    enviarEmailAutomatico();
  }, [location.state, event, eventId, navigate]);

  const generarQR = (ticketId) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketId)}&margin=10&format=png`;
  };

  const handleNewPurchase = () => {
    navigate('/');
  };

  const handleRetryEmail = async () => {
    if (!ventaData) return;
    
    setEmailStatus('enviando');
    try {
      const response = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: ventaData.cliente.email,
          subject: `✅ Confirmación de Entrada - ${ventaData.evento}`,
          userName: ventaData.cliente.nombre,
          ticketNumber: ventaData.orderId,
          eventName: ventaData.evento,
          eventDate: ventaData.fecha,
          eventTime: ventaData.hora,
          eventLocation: ventaData.ubicacion,
          quantity: ventaData.cantidad,
          totalAmount: ventaData.total,
          tickets: ventaData.tickets,
          purchaseDate: ventaData.purchaseDate,
          qrData: ventaData.orderId
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
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header event={event} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BotonVolver />
        
        {/* Header de confirmación */}
        <div className="bg-green-500 text-white rounded-lg p-6 mb-8 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h1 className="text-3xl font-bold mb-2">¡Compra Confirmada!</h1>
          <p className="text-green-100">Tu entrada ha sido reservada exitosamente</p>
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
          {emailStatus === 'enviando' && (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800"></div>
              Enviando comprobante por email...
            </div>
          )}
          {emailStatus === 'enviado' && (
            <div className="flex items-center justify-center gap-2">
              ✅ Comprobante enviado a: <strong>{ventaData.cliente.email}</strong>
            </div>
          )}
          {emailStatus === 'error' && (
            <div className="flex flex-col gap-2">
              <div>❌ Error al enviar el email</div>
              <button 
                onClick={handleRetryEmail}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Reintentar envío
              </button>
            </div>
          )}
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
              
              {/* Detalles de tickets */}
              <div className="mt-4">
                <h3 className="font-semibold mb-2">🎫 Entradas:</h3>
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

          {/* Código QR */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">🎟️ Tu código de acceso</h2>
            <div className="text-center">
              <img 
                src={generarQR(ventaData.orderId)} 
                alt="Código QR" 
                className="mx-auto border-4 border-gray-200 rounded-lg mb-4"
              />
              <p className="text-sm text-gray-600 mb-2">
                Presenta este código QR en la entrada del evento
              </p>
              <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                ID: {ventaData.orderId}
              </div>
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
              <li>• Guarda este código QR, es tu entrada al evento</li>
              <li>• Solo para mayores de 18 años</li>
              <li>• Revisa tu email {ventaData.cliente.email} para los detalles completos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmacion;