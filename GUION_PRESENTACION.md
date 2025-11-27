# 🎤 Guion de Presentación - Monitor de Bebés IoT

## ⏱️ Estructura (10-15 minutos)

1. **Introducción** (1 min)
2. **Problema y Solución** (2 min)
3. **Arquitectura** (2 min)
4. **Demo en Vivo** (5 min)
5. **Tecnologías** (2 min)
6. **Preguntas** (2-3 min)

---

## 📝 Guion Detallado

### 1. INTRODUCCIÓN (1 minuto)

**Decir:**
> "Buenos días/tardes. Hoy les presento **Monitor de Bebés IoT**, un sistema completo de monitoreo en tiempo real que permite a padres y cuidadores supervisar los niveles de ruido en habitaciones de bebés mediante sensores IoT conectados a la nube de Microsoft Azure."

**Mostrar:**
- Título del proyecto
- Logo o captura de pantalla del dashboard

---

### 2. PROBLEMA Y SOLUCIÓN (2 minutos)

#### Problema:
**Decir:**
> "Los padres necesitan monitorear el ambiente de sueño de sus bebés, especialmente:
> - Detectar si el bebé está llorando o necesita atención
> - Monitorear niveles de ruido ambiental
> - Tener un registro histórico para identificar patrones
> - Recibir alertas cuando el ruido excede niveles normales"

#### Solución:
**Decir:**
> "Nuestra solución es un sistema IoT completo que:
> 1. **Captura** datos de ruido desde sensores Arduino/ESP32
> 2. **Transmite** datos a la nube en tiempo real
> 3. **Almacena** información histórica en base de datos
> 4. **Visualiza** datos en dashboard web interactivo
> 5. **Alerta** cuando hay niveles anormales de ruido"

**Mostrar:**
- Diagrama simple del flujo

---

### 3. ARQUITECTURA (2 minutos)

**Decir:**
> "El sistema tiene 4 componentes principales:

> **1. Frontend:** Dashboard web con gráficas interactivas, indicadores visuales y panel de control completo. Desarrollado con HTML5, CSS3 y JavaScript vanilla.

> **2. Backend:** 6 APIs REST implementadas como Azure Functions. Permiten recibir datos, consultar historial, obtener estadísticas y gestionar datos.

> **3. Base de Datos:** Azure Cosmos DB, una base de datos NoSQL que almacena todos los registros de ruido. Usa particionado por deviceId para mejor rendimiento.

> **4. Infraestructura:** Todo desplegado en Azure Static Web Apps, que incluye hosting del frontend y las Functions integradas. Además usamos Key Vault para gestionar secretos de forma segura."

**Mostrar:**
- Diagrama de arquitectura
- Lista de componentes

---

### 4. DEMO EN VIVO (5 minutos)

#### Paso 1: Mostrar Dashboard (1 min)

**Decir:**
> "Vamos a ver la aplicación funcionando. Esta es la URL: [mostrar en pantalla]"

**Abrir:** https://zealous-rock-0962fdc1e.3.azurestaticapps.net

**Explicar mientras navegas:**
> "Aquí vemos el dashboard principal:
> - El indicador grande muestra el nivel actual de ruido en decibeles
> - El color cambia según el nivel: verde para normal, amarillo para advertencia, rojo para peligro
> - La gráfica muestra el historial de los últimos registros
> - Las tarjetas muestran información del dispositivo activo"

**Acciones:**
- Señalar cada elemento
- Explicar el código de colores
- Mostrar cómo la gráfica es interactiva

---

#### Paso 2: Enviar Dato Manualmente (1.5 min)

**Decir:**
> "Ahora voy a simular el envío de datos desde un Arduino. Esto es exactamente lo que haría el hardware real."

**Acciones:**
1. Desplazarse al "Panel de Control"
2. Ir a "Enviar Datos Manualmente"
3. Explicar: "Aquí puedo simular el envío de datos"
4. Ingresar:
   - Device ID: `baby_01`
   - Decibeles: `80` (nivel alto)
5. Clic en "Enviar Dato"
6. Esperar confirmación: "✅ Dato enviado exitosamente: 80 dB"
7. Mostrar cómo la gráfica se actualiza automáticamente
8. Explicar: "El indicador cambió a rojo porque 80 dB es un nivel alto"

**Decir:**
> "Este mismo proceso es lo que haría un Arduino real cada 10 segundos, enviando datos del sensor de ruido."

---

#### Paso 3: Ver Estadísticas (1 min)

**Decir:**
> "El sistema también permite ver estadísticas detalladas de cualquier dispositivo."

**Acciones:**
1. Ir a "Ver Estadísticas"
2. Device ID: `baby_01`
3. Clic en "Ver Estadísticas"
4. Mostrar resultados:
   - Total de registros
   - Promedio de decibeles
   - Nivel máximo
   - Nivel mínimo
   - Último registro

**Decir:**
> "Estas estadísticas son útiles para identificar patrones, por ejemplo, si el bebé se despierta siempre a cierta hora."

---

#### Paso 4: Explicar Flujo con Arduino (1.5 min)

**Decir:**
> "Ahora les muestro cómo funcionaría con hardware real. El Arduino tendría código como este:"

**Mostrar código simplificado:**
```cpp
void loop() {
  // Leer sensor de ruido
  float decibels = sensor.read();
  
  // Conectar a WiFi
  WiFi.begin(ssid, password);
  
  // Preparar JSON
  String json = "{\"deviceId\":\"baby_01\","
                "\"decibels\":" + String(decibels) + ","
                "\"timestamp\":\"" + getTime() + "\"}";
  
  // Enviar a Azure
  HTTPClient http;
  http.begin("https://zealous-rock-0962fdc1e.3.azurestaticapps.net/api/ReceiveNoiseData");
  http.POST(json);
  
  delay(10000); // Esperar 10 segundos
}
```

**Explicar:**
> "El Arduino:
> 1. Lee el sensor cada 10 segundos
> 2. Conecta a WiFi
> 3. Envía datos a nuestra API
> 4. La API guarda en Cosmos DB
> 5. El dashboard se actualiza automáticamente"

---

### 5. TECNOLOGÍAS (2 minutos)

**Decir:**
> "El proyecto usa tecnologías modernas y actuales:

> **Frontend:** HTML5, CSS3, JavaScript vanilla (sin frameworks pesados), y Chart.js para las gráficas. Todo responsive y funciona en cualquier dispositivo.

> **Backend:** Node.js 18 con Azure Functions. Implementamos 6 APIs REST usando REST API nativa de Cosmos DB (sin SDKs problemáticos), con autenticación HMAC-SHA256.

> **Base de Datos:** Azure Cosmos DB, una base de datos NoSQL globalmente distribuida. Usamos Free Tier que nos da 400 RU/s sin costo.

> **Infraestructura:** Azure Static Web Apps que incluye hosting del frontend y las Functions integradas. Todo serverless, escalable automáticamente, y con HTTPS incluido.

> **Seguridad:** Azure Key Vault para almacenar credenciales de forma segura. Todas las conexiones son HTTPS."

**Mostrar:**
- Tabla de tecnologías
- Ventajas de cada una

**Decir:**
> "El costo total es de aproximadamente $0.05 por mes, perfecto para proyectos educativos."

---

### 6. VENTAJAS Y CARACTERÍSTICAS (1 minuto)

**Decir:**
> "Las principales ventajas del sistema son:

> ✅ **100% Serverless** - No hay servidores que mantener, Azure lo gestiona todo
> ✅ **Escalable Automáticamente** - Puede crecer de 1 a 1000 dispositivos sin cambios
> ✅ **Bajo Costo** - Free tier disponible, ideal para estudiantes
> ✅ **Tiempo Real** - Datos actualizados cada 10 segundos
> ✅ **Global** - Accesible desde cualquier lugar con internet
> ✅ **Seguro** - HTTPS, Key Vault, validaciones en todas las APIs"

---

### 7. CASOS DE USO (1 minuto)

**Decir:**
> "El sistema puede usarse en varios escenarios:

> 1. **Padres en casa:** Monitorear bebé desde otra habitación sin interrumpir
> 2. **Guarderías:** Múltiples dispositivos para múltiples bebés, todo centralizado
> 3. **Análisis de patrones:** Identificar horarios en que el bebé se despierta más
> 4. **Alertas:** Notificación inmediata cuando el ruido excede niveles normales"

---

### 8. CONCLUSIÓN (1 minuto)

**Decir:**
> "En resumen, **Monitor de Bebés IoT** es un proyecto completo que demuestra:

> 1. Integración completa de Hardware + Software + Cloud
> 2. Arquitectura moderna serverless, escalable y económica
> 3. Uso de tecnologías actuales de Microsoft Azure
> 4. Solución a un problema real y práctico
> 5. Deployment completo y listo para producción

> Es ideal para proyectos universitarios, portafolio profesional, o como base para aprender cloud computing.

> ¿Hay alguna pregunta?"

---

## 🎯 Tips para la Presentación

### ✅ Hacer:
- **Practicar la demo** antes de presentar
- **Tener la URL abierta** antes de empezar
- **Explicar mientras navegas** (no solo mostrar)
- **Hacer pausas** para que la audiencia procese
- **Mantener contacto visual**
- **Usar gestos** para señalar elementos en pantalla

### ❌ Evitar:
- Leer directamente de las diapositivas
- Apresurarse en la demo
- Asumir que todos entienden términos técnicos
- Perder tiempo en detalles irrelevantes
- No tener plan B si falla internet

---

## 🔧 Plan B (Si algo falla)

### Si no hay internet:
- Tener capturas de pantalla preparadas
- Mostrar código del proyecto
- Explicar arquitectura con diagramas

### Si la demo no funciona:
- Explicar qué debería pasar
- Mostrar capturas de pantalla
- Enfocarse en la arquitectura y código

### Si hay preguntas técnicas difíciles:
- Ser honesto: "Esa es una excelente pregunta, déjame investigar más"
- Ofrecer seguir la conversación después
- Redirigir a aspectos que sí conoces bien

---

## 📊 Diagrama para Mostrar

```
┌─────────────┐
│  Arduino    │  ← Sensor de Ruido
│  / ESP32    │
└──────┬──────┘
       │ HTTP POST
       ▼
┌──────────────────────┐
│  Azure Functions     │  ← 6 APIs REST
│  (Backend)           │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Cosmos DB           │  ← Base de Datos
│  (NoSQL)             │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Dashboard Web       │  ← Frontend
│  (HTML/CSS/JS)       │
└──────────────────────┘
```

---

## 🎤 Frases Clave para Recordar

1. **Apertura:** "Sistema completo de monitoreo IoT en tiempo real"
2. **Problema:** "Padres necesitan monitorear ambiente de sueño"
3. **Solución:** "Hardware + Software + Cloud integrados"
4. **Tecnología:** "100% en Azure, serverless, escalable"
5. **Costo:** "Aproximadamente $0.05 por mes"
6. **Cierre:** "Listo para producción, ideal para aprendizaje"

---

## ⏱️ Timing Sugerido

| Sección | Tiempo | % Total |
|---------|--------|---------|
| Introducción | 1 min | 7% |
| Problema/Solución | 2 min | 13% |
| Arquitectura | 2 min | 13% |
| Demo en Vivo | 5 min | 33% |
| Tecnologías | 2 min | 13% |
| Casos de Uso | 1 min | 7% |
| Conclusión | 1 min | 7% |
| Preguntas | 2-3 min | 13-20% |
| **TOTAL** | **15-16 min** | **100%** |

---

## 📝 Checklist Pre-Presentación

- [ ] URL de la app funciona
- [ ] Tener datos de prueba en la base de datos
- [ ] Navegador abierto y listo
- [ ] Capturas de pantalla de respaldo
- [ ] Código de ejemplo preparado
- [ ] Diagrama de arquitectura listo
- [ ] Conocer bien cada funcionalidad
- [ ] Practicar el flujo de la demo
- [ ] Preparar respuestas a preguntas comunes

---

**¡Éxito en tu presentación! 🎉**

