import { inventario } from '../services/inventario.js'
import { envios } from '../services/envios.js'
import { retry } from './retry.js'
import { CircuitBreaker } from './CircuitBreaker.js'
import { eventBus } from './eventBus.js'

const inventarioBreaker = new CircuitBreaker({ umbralFallos: 3, tiempoEsperaMs: 5000 })

export class FachadaPedidos {
  constructor(pago, breaker = inventarioBreaker) {
    this.pago = pago
    this.breaker = breaker
  }

  async procesarPedido(pedido) {
    // 1. Reservar inventario protegido con Circuit Breaker + Retry
    await this.breaker.ejecutar(() =>
      retry(() => inventario.reservar(pedido.items), { intentos: 3, esperaMs: 300 })
    )

    // 2. Procesar el pago con el adaptador inyectado
    const pago = await this.pago.procesar(pedido.total)
    if (!pago.exito) {
      throw new Error('El pago fue rechazado. No se pudo completar el pedido.')
    }

    // 3. Programar el despacho
    const envio = await envios.programar(pedido.direccion)

    // 4. Disparar evento asíncrono en lugar de llamar a notificaciones directamente
    eventBus.emit('pedido:procesado', { ...pedido, pago, envio })

    return { pago, envio, completado: true }
  }
}
