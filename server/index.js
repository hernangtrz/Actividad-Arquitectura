import { crearServicioCatalogo } from './catalogoService.js'
import { crearServicioPagos } from './pagosService.js'
import { crearApiGateway } from './gateway.js'

console.log('Iniciando Arquitectura de Integración (Reto Opcional)')

// Iniciar microservicios simulados en puertos independientes
crearServicioCatalogo(4001)
crearServicioPagos(4002)

// Iniciar el API Gateway en el puerto 4000
crearApiGateway({ puerto: 4000 })
