/**
 * EJERCICIO 3 — MVVM: ViewModel
 *
 * Extrae aquí TODA la lógica que hoy vive en OrdersApp.jsx: el estado
 * del formulario, la lista de pedidos, loading, error, y la función
 * que arma el pedido y llama a FachadaPedidos.
 *
 * Debe devolver un objeto con esta forma (es el "contrato" que
 * OrdersView.jsx va a consumir):
 *
 * {
 *   pedidos,         // array de pedidos ya procesados
 *   loading,         // boolean
 *   error,           // string | null
 *   form: { cliente, direccion, itemsText, total, pasarela },
 *   setField,        // (campo, valor) => void — actualiza un campo del form
 *   enviarPedido,    // (evento) => Promise<void> — comando del submit
 * }
 *
 * La Vista (OrdersView) NO debe importar FachadaPedidos ni los
 * Adapters directamente: solo debe hablar con este hook. Eso es lo
 * que hace que Vista y lógica queden desacopladas (a diferencia de
 * OrdersApp.jsx, donde estaban mezcladas).
 */
import { useState } from 'react'
import { FachadaPedidos } from '../patterns/FachadaPedidos.js'
import { AdapterPasarelaX } from '../services/pagos/AdapterPasarelaX.js'
import { AdapterPasarelaY } from '../services/pagos/AdapterPasarelaY.js'

const FORM_INICIAL = {
  cliente: '',
  direccion: '',
  itemsText: '',
  total: '',
  pasarela: 'X',
}

export function usePedidosViewModel() {
  const [pedidos, setPedidos] = useState([])
  const [form, setForm] = useState(FORM_INICIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const setField = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  const enviarPedido = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const adapter = form.pasarela === 'X' ? new AdapterPasarelaX() : new AdapterPasarelaY()
      const facade = new FachadaPedidos(adapter)

      const pedido = {
        cliente: form.cliente,
        direccion: form.direccion,
        items: form.itemsText.split(',').map((s) => s.trim()).filter(Boolean),
        total: Number(form.total),
      }

      await facade.procesarPedido(pedido)

      setPedidos((prev) => [
        { ...pedido, pasarela: form.pasarela, procesadoEn: new Date().toLocaleTimeString() },
        ...prev,
      ])
      setForm(FORM_INICIAL)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    pedidos,
    loading,
    error,
    form,
    setField,
    enviarPedido,
  }
}
