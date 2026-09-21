import { notificaciones } from '../services/notificaciones.js'
import { eventBus } from './eventBus.js'

export function iniciarSuscriptorNotificaciones() {
  eventBus.on('pedido:procesado', async (pedido) => {
    try {
      await notificaciones.confirmar(pedido.cliente)
    } catch (error) {
      console.error('Error al enviar notificación del pedido:', error)
    }
  })
}
