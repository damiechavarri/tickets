import { v4 as uuidv4 } from 'uuid'

// Generar un código único por ticket
export function generarCodigoUnico(eventId, ticketType, index) {
  const uniqueId = uuidv4().slice(0, 8).toUpperCase()
  return `${eventId}-${ticketType}-${uniqueId}-${index}`
}

// Generar URL del QR desde backend Express
export function generarQRCode(ticketId) {
  return `http://localhost:4000/qr/${ticketId}.png`
}

// Generar tickets únicos para la compra
export function generarTicketsUnicos(eventId, ticketQuantities, customerData) {
  const tickets = []

  Object.entries(ticketQuantities).forEach(([ticketId, quantity]) => {
    for (let i = 0; i < quantity; i++) {
      const codigoUnico = generarCodigoUnico(eventId, ticketId, i + 1)

      tickets.push({
        id: codigoUnico,
        ticketType: ticketId,
        numero: i + 1,
        codigoQR: generarQRCode(codigoUnico), // URL de backend
        comprador: `${customerData.nombre} ${customerData.apellido}`,
        email: customerData.email,
        valido: true,
        usado: false
      })
    }
  })

  return tickets
}
