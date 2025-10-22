import QRCode from 'qrcode'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: 'dvsvviotj',
  api_key: '169557517643445',  
  api_secret: 'd4lojn44lQUPDgtxv_tlcVY7b-w'
})

export const handler = async (event) => {
  // Manejar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  const ticketId = event.path.split('/').pop()
  
  try {
    const qrDataURL = await QRCode.toDataURL(ticketId, { 
      width: 300, 
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' }
    })

    const uploadResult = await cloudinary.uploader.upload(qrDataURL, {
      folder: 'tickets-qr',
      public_id: ticketId,
      overwrite: true
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        qrDataURL: qrDataURL,
        qrImageUrl: uploadResult.secure_url,
        ticketId: ticketId
      })
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message })
    }
  }
}