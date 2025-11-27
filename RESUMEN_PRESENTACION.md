# 🍼 Monitor de Bebés IoT - Resumen Ejecutivo

## 🎯 ¿Qué es?

Sistema IoT completo para monitorear niveles de ruido en habitaciones de bebés en **tiempo real** desde cualquier navegador web.

---

## 🔑 Puntos Clave (30 segundos)

1. **Hardware:** Arduino/ESP32 con sensor de ruido
2. **Backend:** 6 APIs REST en Azure Functions
3. **Base de Datos:** Cosmos DB (NoSQL)
4. **Frontend:** Dashboard web interactivo
5. **Costo:** ~$0.05/mes (Free Tier)

---

## 🏗️ Arquitectura Simple

```
Arduino → API → Cosmos DB → Dashboard Web
```

**Todo en Azure:**
- Static Web Apps (Frontend + Backend)
- Cosmos DB (Base de datos)
- Key Vault (Seguridad)

---

## ⚡ Funcionalidades Principales

### 1. **Dashboard en Tiempo Real**
- Indicador visual con colores (🟢🟡🔴)
- Gráfica interactiva de historial
- Actualización automática cada 10 segundos

### 2. **Panel de Control**
- 📤 Enviar datos manualmente (simular Arduino)
- 📊 Ver estadísticas (promedio, max, min)
- 🗑️ Eliminar datos antiguos o por dispositivo

### 3. **6 APIs REST**
- `POST /api/ReceiveNoiseData` - Guardar datos
- `GET /api/GetNoiseHistory` - Obtener historial
- `GET /api/GetDeviceStats` - Estadísticas
- `GET /api/GetActiveDevices` - Listar dispositivos
- `DELETE /api/DeleteOldData` - Limpiar datos viejos
- `DELETE /api/DeleteDeviceData` - Eliminar por dispositivo

---

## 💻 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript, Chart.js |
| **Backend** | Node.js 18, Azure Functions |
| **Base de Datos** | Azure Cosmos DB (NoSQL) |
| **Infraestructura** | Azure Static Web Apps |
| **Seguridad** | Azure Key Vault |

---

## 🎬 Demo Rápida (2 minutos)

### 1. Mostrar Dashboard (30 seg)
- Abrir: https://zealous-rock-0962fdc1e.3.azurestaticapps.net
- Explicar: Indicador, gráfica, tarjetas

### 2. Enviar Dato (30 seg)
- Panel de Control → Enviar Datos
- Device ID: `baby_01`, Decibeles: `80`
- Clic "Enviar Dato"
- ✅ Confirmación aparece
- Gráfica se actualiza

### 3. Ver Estadísticas (30 seg)
- Panel de Control → Ver Estadísticas
- Device ID: `baby_01`
- Clic "Ver Estadísticas"
- Mostrar: Total, Promedio, Max, Min

### 4. Explicar Arduino (30 seg)
- "Así funcionaría con hardware real"
- Mostrar código simplificado
- Explicar flujo: Sensor → WiFi → API → DB → Dashboard

---

## 📊 Números del Proyecto

- **6 APIs** implementadas
- **1 Base de Datos** Cosmos DB
- **1 Dashboard** web completo
- **< 200ms** latencia API
- **$0.05/mes** costo total
- **100%** serverless

---

## 🎯 Casos de Uso

1. **Padres:** Monitorear bebé desde otra habitación
2. **Guarderías:** Múltiples dispositivos, múltiples bebés
3. **Análisis:** Identificar patrones de sueño
4. **Alertas:** Notificación cuando ruido excede niveles

---

## 🚀 Ventajas

✅ **Serverless** - Sin servidores que mantener  
✅ **Escalable** - Crece automáticamente  
✅ **Económico** - Free tier disponible  
✅ **Rápido** - < 2 segundos carga  
✅ **Global** - Accesible desde cualquier lugar  
✅ **Seguro** - HTTPS, Key Vault, validaciones  

---

## 🔗 URLs Importantes

- **App Web:** https://zealous-rock-0962fdc1e.3.azurestaticapps.net
- **Azure Portal:** https://portal.azure.com

---

## 💡 Preguntas Probables

**Q: ¿Por qué Azure?**  
A: Mejor Free Tier para estudiantes, Static Web Apps es más simple

**Q: ¿Es seguro?**  
A: Sí, HTTPS, secretos en Key Vault, validaciones en todas las APIs

**Q: ¿Puede escalar?**  
A: Sí, Cosmos DB y Static Web Apps escalan automáticamente

**Q: ¿Funciona sin internet?**  
A: El Arduino puede guardar datos localmente y sincronizar después

---

## 📝 Conclusión (1 minuto)

**Monitor de Bebés IoT** demuestra:

1. ✅ **Integración completa** Hardware + Software + Cloud
2. ✅ **Arquitectura moderna** Serverless, escalable, económica
3. ✅ **Tecnologías actuales** Azure, Node.js, Cosmos DB
4. ✅ **Caso de uso real** Soluciona problema práctico
5. ✅ **Listo para producción** Deployment completo en Azure

**Ideal para:** Proyectos universitarios, portafolio, aprendizaje de cloud computing

---

**🎉 ¡Listo para presentar!**

