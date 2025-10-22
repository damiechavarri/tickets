import { useParams } from 'react-router-dom';

function Confirmacion() {
  const { eventId } = useParams();
  
  console.log('🔍 Confirmacion component mounted');
  console.log('🔍 eventId:', eventId);
  
  // Si no ves estos logs, el componente no se está montando
  
  return (
    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'green' }}>✅ Pago Confirmado</h1>
      <p>Evento: {eventId || 'No especificado'}</p>
      <p>Tu reserva ha sido procesada exitosamente.</p>
      <button onClick={() => window.location.href = '/'}>
        Volver al Inicio
      </button>
    </div>
  );
}

export default Confirmacion;