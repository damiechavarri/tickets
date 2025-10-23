// frontend/api/send-confirmation-email.js
console.log('🔧 FUNCIÓN CARGANDO...');

exports.handler = async (event, context) => {
  console.log('✅ FUNCIÓN EJECUTADA - Vercel');
  
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
  };

  try {
    console.log('📨 Método:', event.httpMethod);
    
    // Preflight
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    // GET para testing
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          status: 'success',
          message: 'Función funcionando en Vercel',
          timestamp: new Date().toISOString()
        })
      };
    }

    // POST
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      console.log('📧 Datos recibidos:', body);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Email simulado enviado correctamente',
          received: body
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };

  } catch (error) {
    console.error('❌ Error en función:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error interno',
        details: error.message 
      })
    };
  }
};