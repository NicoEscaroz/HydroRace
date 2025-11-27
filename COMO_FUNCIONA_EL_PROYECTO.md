# 📖 Cómo Funciona el Proyecto - Guía Completa

## 🔄 Flujo Completo de Datos

### 1. **Ingreso de Datos desde Dispositivo (Arduino/ESP32)**

```
┌─────────────┐
│  Arduino    │  ← Sensor de Ruido mide decibeles
│  / ESP32    │
└──────┬──────┘
       │
       │ Código en Arduino:
       │ - Lee sensor cada 10 segundos
       │ - Conecta a WiFi
       │ - Prepara JSON
       │
       ▼
┌─────────────────────────────────────┐
│  HTTP POST Request                   │
│  POST /api/ReceiveNoiseData          │
│  Headers: Content-Type: application/json │
│  Body: {                              │
│    "deviceId": "baby_01",            │
│    "decibels": 75,                   │
│    "timestamp": "2025-11-27T..."    │
│  }                                    │
└──────┬───────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Azure Function: ReceiveNoiseData    │
│  - Valida datos recibidos            │
│  - Crea documento con ID único       │
│  - Guarda en Cosmos DB               │
└──────┬───────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Azure Cosmos DB                     │
│  Database: BabyMonitorDB             │
│  Container: NoiseData                │
│  Documento guardado:                 │
│  {                                   │
│    "id": "baby_01_1234567890",      │
│    "deviceId": "baby_01",            │
│    "decibels": 75,                   │
│    "timestamp": "2025-11-27T...",   │
│    "createdAt": "2025-11-27T..."    │
│  }                                   │
└─────────────────────────────────────┘
```

---

## 📝 Formas de Ingresar Datos

### **Opción 1: Desde el Dashboard Web (Simulación)**

1. Abre: https://black-ground-0a9bdd31e.3.azurestaticapps.net
2. Ve a "Panel de Control"
3. Sección "Enviar Datos Manualmente"
4. Completa:
   - **Device ID:** `baby_01` (o cualquier ID)
   - **Decibeles:** `75` (valor entre 0-120)
5. Clic en "Enviar Dato"
6. Verás: "✅ Dato enviado exitosamente: 75 dB"

**Código que se ejecuta:**
```javascript
// frontend/app.js (líneas ~180-225)
const response = await fetch(`${API_BASE_URL}/api/ReceiveNoiseData`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    deviceId,
    decibels,
    timestamp: new Date().toISOString()
  })
});
```

---

### **Opción 2: Desde Arduino/ESP32 (Hardware Real)**

**Código para Arduino/ESP32:**

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Configuración WiFi
const char* ssid = "TU_WIFI";
const char* password = "TU_PASSWORD";

// URL de la API
const char* apiUrl = "https://black-ground-0a9bdd31e.3.azurestaticapps.net/api/ReceiveNoiseData";

// Sensor (simulado, reemplaza con tu sensor real)
float readNoiseSensor() {
  // Tu código para leer el sensor
  return random(40, 90); // Simulación
}

void setup() {
  Serial.begin(115200);
  
  // Conectar a WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi conectado!");
}

void loop() {
  // Leer sensor
  float decibels = readNoiseSensor();
  
  // Crear JSON
  StaticJsonDocument<200> doc;
  doc["deviceId"] = "baby_01";
  doc["decibels"] = decibels;
  doc["timestamp"] = getISO8601Time(); // Función para obtener tiempo ISO
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Enviar a Azure
  HTTPClient http;
  http.begin(apiUrl);
  http.addHeader("Content-Type", "application/json");
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.print("Dato enviado: ");
    Serial.println(httpResponseCode);
  } else {
    Serial.print("Error: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
  
  delay(10000); // Esperar 10 segundos
}
```

---

### **Opción 3: Desde Terminal (cURL)**

```bash
curl -X POST "https://black-ground-0a9bdd31e.3.azurestaticapps.net/api/ReceiveNoiseData" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "baby_01",
    "decibels": 75,
    "timestamp": "2025-11-27T10:30:00Z"
  }'
```

---

## 🔍 Cómo Verificar que los Datos se Guardan en Cosmos DB

### **Método 1: Desde el Dashboard Web**

1. Abre el dashboard
2. La gráfica muestra los datos guardados
3. Ve a "Ver Estadísticas" → Ingresa Device ID → Clic "Ver Estadísticas"
4. Verás: Total de registros, promedio, máximo, mínimo

---

### **Método 2: Desde Azure Portal (Visual)**

1. **Abre Azure Portal:** https://portal.azure.com
2. **Busca tu Cosmos DB:**
   - Busca: `babymonitor-cosmos-dev-2i4eazaehynzs`
   - O ve a: Resource Groups → Azure4 → Cosmos DB account
3. **Abre Data Explorer:**
   - En el menú izquierdo, clic en "Data Explorer"
4. **Navega a los datos:**
   - Expande: `BabyMonitorDB` → `NoiseData`
   - Clic en "Items" (o "Items" en español)
5. **Verás todos los documentos guardados:**
   ```json
   {
     "id": "baby_01_1234567890",
     "deviceId": "baby_01",
     "decibels": 75,
     "timestamp": "2025-11-27T10:30:00Z",
     "createdAt": "2025-11-27T10:30:00Z",
     "_rid": "...",
     "_self": "...",
     "_etag": "...",
     "_attachments": "attachments/",
     "_ts": 1234567890
   }
   ```

---

### **Método 3: Desde Azure CLI (Terminal)**

```bash
# 1. Obtener credenciales
COSMOS_ACCOUNT="babymonitor-cosmos-dev-2i4eazaehynzs"
RESOURCE_GROUP="Azure4"
COSMOS_KEY=$(az cosmosdb keys list \
  --name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --query primaryMasterKey -o tsv)

COSMOS_ENDPOINT=$(az cosmosdb show \
  --name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --query documentEndpoint -o tsv)

# 2. Consultar datos usando Azure CLI
az cosmosdb sql container query \
  --account-name $COSMOS_ACCOUNT \
  --database-name BabyMonitorDB \
  --name NoiseData \
  --resource-group $RESOURCE_GROUP \
  --query-text "SELECT * FROM c ORDER BY c.timestamp DESC OFFSET 0 LIMIT 10"
```

---

### **Método 4: Desde la API (Programático)**

```bash
# Obtener últimos 10 registros
curl "https://black-ground-0a9bdd31e.3.azurestaticapps.net/api/GetNoiseHistory?limit=10" | jq

# Obtener datos de un dispositivo específico
curl "https://black-ground-0a9bdd31e.3.azurestaticapps.net/api/GetNoiseHistory?deviceId=baby_01&limit=5" | jq

# Ver estadísticas
curl "https://black-ground-0a9bdd31e.3.azurestaticapps.net/api/GetDeviceStats?deviceId=baby_01" | jq
```

---

## 🧪 Prueba Completa: Enviar y Verificar

### **Paso 1: Enviar un Dato**

```bash
curl -X POST "https://black-ground-0a9bdd31e.3.azurestaticapps.net/api/ReceiveNoiseData" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test_device",
    "decibels": 80,
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "id": "test_device_1234567890",
    "deviceId": "test_device",
    "decibels": 80,
    "timestamp": "2025-11-27T10:30:00Z",
    "createdAt": "2025-11-27T10:30:00Z"
  }
}
```

### **Paso 2: Verificar que se Guardó**

```bash
# Obtener el dato recién guardado
curl "https://black-ground-0a9bdd31e.3.azurestaticapps.net/api/GetNoiseHistory?deviceId=test_device&limit=1" | jq
```

**Respuesta esperada:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "test_device_1234567890",
      "deviceId": "test_device",
      "decibels": 80,
      "timestamp": "2025-11-27T10:30:00Z"
    }
  ]
}
```

---

## 📊 Estructura de Datos en Cosmos DB

### **Database: BabyMonitorDB**
- **Throughput:** 400 RU/s (Request Units por segundo)
- **Tipo:** SQL API

### **Container: NoiseData**
- **Partition Key:** `/deviceId` (permite escalar por dispositivo)
- **Indexing:** Automático en todos los campos

### **Documento (Ejemplo):**
```json
{
  "id": "baby_01_1732704000000",
  "deviceId": "baby_01",
  "decibels": 75.5,
  "timestamp": "2025-11-27T10:30:00.000Z",
  "createdAt": "2025-11-27T10:30:00.123Z",
  "_rid": "abc123...",
  "_self": "dbs/.../colls/.../docs/...",
  "_etag": "\"00000000-0000-0000-0000-000000000000\"",
  "_attachments": "attachments/",
  "_ts": 1732704000
}
```

**Campos importantes:**
- `id`: Identificador único (deviceId_timestamp)
- `deviceId`: ID del dispositivo que envió el dato
- `decibels`: Nivel de ruido medido
- `timestamp`: Fecha/hora del evento
- `createdAt`: Fecha/hora de creación en la BD

---

## 🔐 Credenciales y Configuración

### **Variables de Entorno en Azure Functions:**

Las funciones obtienen las credenciales desde variables de entorno:

```javascript
// api/cosmosRestClient.js
this.endpoint = process.env.COSMOS_DB_ENDPOINT;
this.key = process.env.COSMOS_DB_KEY;
this.databaseId = process.env.COSMOS_DB_DATABASE || 'BabyMonitorDB';
this.containerId = process.env.COSMOS_DB_CONTAINER || 'NoiseData';
```

### **Configuradas en Static Web App:**

```bash
# Ver variables de entorno configuradas
az staticwebapp appsettings list \
  --name babymonitor-web-dev-2i4eazaehynzs \
  --resource-group Azure4
```

---

## 🎯 Resumen: Flujo Completo

1. **Dispositivo/Usuario** → Envía POST a `/api/ReceiveNoiseData`
2. **Azure Function** → Valida y procesa datos
3. **Cosmos DB** → Guarda documento en `BabyMonitorDB/NoiseData`
4. **Dashboard** → Consulta `/api/GetNoiseHistory` y muestra datos
5. **Usuario** → Ve datos en gráfica y estadísticas

---

## ✅ Checklist de Verificación

- [ ] Puedo enviar datos desde el dashboard
- [ ] Recibo confirmación "Dato enviado exitosamente"
- [ ] La gráfica se actualiza automáticamente
- [ ] Puedo ver estadísticas del dispositivo
- [ ] Los datos aparecen en Azure Portal → Data Explorer
- [ ] La API `/api/GetNoiseHistory` retorna los datos

---

**¿Necesitas ayuda con algún paso específico?** 🚀

