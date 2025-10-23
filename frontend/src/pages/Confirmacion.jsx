// src/pages/Confirmacion.jsx
import { useState } from 'react';

const Confirmacion = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendConfirmation = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Llamar a tu API route de Vercel
      const response = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'usuario@ejemplo.com',
          subject: 'Confirmación de Ticket',
          userName: 'Juan Pérez',
          ticketNumber: 'TKT-001',
          eventName: 'Concierto de Rock'
        }),
      });
      
      const result = await response.json();
      console.log('Respuesta de API:', result);
      
      if (result.success) {
        setMessage('✅ Email enviado correctamente');
      } else {
        setMessage('❌ Error: ' + (result.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error llamando a la API:', error);
      setMessage('❌ Error de conexión con el servidor');
    }
    
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Confirmación de Ticket</h2>
      
      <button 
        onClick={handleSendConfirmation} 
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {loading ? 'Enviando...' : 'Confirmar y Enviar Email'}
      </button>
      
      {message && (
        <p className={`mt-4 p-2 rounded ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Confirmacion;