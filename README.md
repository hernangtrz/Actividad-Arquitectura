# Gestión de Pedidos — Actividad Práctica (Patrones de Diseño)

Proyecto desarrollado en **React + Vite** para la actividad práctica de **Patrones y principios de diseño — Parte 1** (Arquitectura de Aplicaciones Web - Universidad Popular del Cesar).

---

## 🚀 Cómo ejecutar el proyecto

```bash
npm install
npm run dev
```

Abre en tu navegador la URL que indica la consola (generalmente `http://localhost:5173`).

---

## 🏗️ Patrones Implementados

### 1. Patrón Adapter (`src/services/pagos/AdapterPasarelaY.js`)
* **Propósito:** Unifica la interfaz de `SdkPasarelaY` (que trabaja en centavos y rechaza promesas) bajo el contrato común `IPago.procesar(monto)`.
* **Resultado:** La aplicación puede alternar de forma transparente entre la Pasarela X y la Pasarela Y devolviendo siempre instancias de `Resultado(exito, idTransaccion)`.

### 2. Patrón Facade (`src/patterns/FachadaPedidos.js`)
* **Propósito:** Oculta la complejidad de coordinar múltiples servicios (Inventario, Pagos, Envíos y Notificaciones) detrás de un único método `procesarPedido(pedido)`.
* **Flujo controlado:** Si el pago es rechazado, se aborta la ejecución y se lanza un error descriptivo sin disparar envíos ni notificaciones.

### 3. Patrón MVVM (`src/viewmodel/usePedidosViewModel.js` y `src/components/OrdersView.jsx`)
* **Separación de responsabilidades:**
  * **Model:** Servicios de negocio, pasarelas y fachada.
  * **ViewModel (`usePedidosViewModel`):** Custom Hook que centraliza el estado del formulario, la lista de pedidos, loading, errores y la ejecución de la fachada.
  * **View (`OrdersView`):** Componente puramente presentacional sin estados locales (`useState`), sin efectos (`useEffect`) y sin dependencias directas a servicios.

### 4. Patrones de Resiliencia (`src/patterns/retry.js` y `src/patterns/CircuitBreaker.js`)
* **Simulación de fallas:** `inventario.js` simula una tasa de fallo aleatoria (~30%).
* **Retry:** Reintenta operaciones fallidas con backoff creciente.
* **Circuit Breaker:** Controla el flujo a través de 3 estados:
  * `CERRADO`: Permite el paso de peticiones y cuenta errores.
  * `ABIERTO`: Falla rápido (*fail-fast*) cuando se supera el umbral de fallos, evitando saturar el servicio.
  * `SEMI-ABIERTO`: Pasado un tiempo de enfriamiento, permite una llamada de prueba para verificar si el servicio se recuperó.

### 5. Comunicación por Eventos (`src/patterns/eventBus.js` y `src/patterns/notificacionesSubscriber.js`)
* **Desacoplamiento:** `FachadaPedidos` ya no importa directamente `notificaciones.js`. En su lugar, emite el evento `pedido:procesado` a través de un bus de eventos y un suscriptor independiente maneja el envío de la notificación.

---

## 🌟 Reto Opcional: Mini API Gateway con Express (+10 pts)

Se implementó un entorno simulado de microservicios con un **API Gateway**:
* **Servicio Catálogo (`http://localhost:4001`)**: Expone `POST /catalogo/validar` para verificar disponibilidad de items.
* **Servicio Pagos (`http://localhost:4002`)**: Expone `POST /pagos/procesar` para procesar cobros por pasarela.
* **API Gateway (`http://localhost:4000`)**: Expone `POST /pedidos`, recibe la petición del cliente y orquesta en paralelo/secuencia las llamadas a los servicios internos, retornando una respuesta consolidada.

### Cómo ejecutar y probar el API Gateway:

1. Iniciar los servicios y el gateway:
```bash
npm run gateway
```

2. Probar con una petición `POST` (en otra terminal o Postman/cURL):
```bash
curl -X POST http://localhost:4000/pedidos \
  -H "Content-Type: application/json" \
  -d "{\"cliente\": \"Carlos Gomez\", \"direccion\": \"Calle 10 # 5-20\", \"items\": [\"Teclado Mecanico\", \"Mouse Gamer\"], \"total\": 120000, \"pasarela\": \"Y\"}"
```

Respuesta esperada:
```json
{
  "exito": true,
  "mensaje": "Pedido procesado con éxito a través del API Gateway",
  "pedido": {
    "cliente": "Carlos Gomez",
    "direccion": "Calle 10 # 5-20",
    "items": ["Teclado Mecanico", "Mouse Gamer"],
    "total": 120000,
    "transaccion": "Y-A1B2C3D4",
    "pasarela": "Y",
    "estado": "CONFIRMADO"
  }
}
```

---

## 📝 Respuestas a las Preguntas de Reflexión

### 1. ¿Por qué disparar un evento en vez de llamar directamente a `notificaciones.confirmar()` reduce el acoplamiento entre la Fachada y las notificaciones?
Disparar un evento (`pedido:procesado`) elimina la dependencia estática y directa en código entre la Fachada y el módulo de notificaciones. La Fachada únicamente comunica un hecho ocurrido en el dominio sin saber quién lo escucha ni cómo se procesa; de este modo, si en el futuro se requieren añadir nuevos oyentes (analítica, auditoría, facturación electrónica) o cambiar el proveedor de mensajería, la Fachada permanece intacta, respetando el principio Open/Closed.

### 2. Al probar la app varias veces seguidas con inventario fallando, ¿qué diferencia notaron entre el comportamiento en estado CERRADO y en estado ABIERTO del Circuit Breaker?
En estado **CERRADO**, el sistema intenta ejecutar la operación y aplica los reintentos (`retry`), por lo que ante un fallo hay un retardo perceptible mientras espera los intervalos de backoff. En contraste, cuando el circuito pasa a estado **ABIERTO** tras superar el umbral de fallos, la petición falla inmediatamente en 0ms (*fail-fast*) sin tocar el servicio caído, ahorrando recursos del cliente/servidor y mostrando directamente el mensaje de indisponibilidad hasta que transcurre el tiempo para pasar a **SEMI-ABIERTO**.

### 3. Si esta misma aplicación tuviera que exponerse a una web y a una app móvil con necesidades de datos distintas, ¿usarían un API Gateway o un BFF? Justifiquen en 2-3 líneas.
Usaría el patrón **BFF (Backend for Frontend)**, creando un backend específico para la Web y otro para la App Móvil. Esto permite que el backend móvil optimice el consumo de ancho de banda, agregue llamadas y devuelva payloads reducidos según las limitaciones del dispositivo, mientras que el cliente web puede recibir respuestas más detalladas, permitiendo que cada interfaz evolucione de forma independiente sin interferir entre sí.
