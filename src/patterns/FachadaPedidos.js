import { inventario } from '../services/inventario.js'
import { envios } from '../services/envios.js'
import { notificaciones } from '../services/notificaciones.js'

/**
 * EJERCICIO 2 — Facade
 *
 * procesarPedido() debe orquestar, EN ORDEN, estas 4 operaciones:
 *   1. inventario.reservar(pedido.items)
 *   2. this.pago.procesar(pedido.total)      (el IPago inyectado)
 *   3. envios.programar(pedido.direccion)
 *   4. notificaciones.confirmar(pedido.cliente)
 *
 * Si el pago falla (resultado.exito === false), NO debe continuar con
 * envío ni notificación: debe lanzar un Error con un mensaje claro.
 *
 * Referencia: mismo patrón visto en clase, pero aquí "Pagos" es un
 * IPago ya adaptado (Ejercicio 1) en vez de un servicio directo — así
 * la Fachada no sabe (ni le importa) si por debajo está la Pasarela X
 * o la Y.
 */
export class FachadaPedidos {
  constructor(pago) {
    this.pago = pago // instancia de IPago: AdapterPasarelaX o AdapterPasarelaY
  }

  async procesarPedido(pedido) {
    await inventario.reservar(pedido.items)

    const pago = await this.pago.procesar(pedido.total)
    if (!pago.exito) {
      throw new Error('El pago fue rechazado. No se pudo completar el pedido.')
    }

    const envio = await envios.programar(pedido.direccion)
    await notificaciones.confirmar(pedido.cliente)

    return { pago, envio, completado: true }
  }
}
