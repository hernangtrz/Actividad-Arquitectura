function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Reintenta la ejecución de una función asíncrona ante fallos con backoff creciente.
 * @param {Function} fn - Función asíncrona a ejecutar.
 * @param {Object} opciones - Configuración de reintentos.
 * @param {number} opciones.intentos - Cantidad máxima de intentos.
 * @param {number} opciones.esperaMs - Tiempo base de espera en milisegundos.
 */
export async function retry(fn, { intentos = 3, esperaMs = 300 } = {}) {
  let ultimoError

  for (let intento = 1; intento <= intentos; intento++) {
    try {
      return await fn()
    } catch (error) {
      ultimoError = error
      if (intento < intentos) {
        // Backoff incremental: espera cada vez un poco más
        await delay(esperaMs * intento)
      }
    }
  }

  throw ultimoError
}
