#!/bin/bash

# Script para verificar datos en Cosmos DB
# Uso: ./verificar-datos.sh

API_URL="https://black-ground-0a9bdd31e.3.azurestaticapps.net"

echo "🔍 Verificando datos en Cosmos DB..."
echo ""

# 1. Total de registros
echo "📊 Total de registros guardados:"
TOTAL=$(curl -s "${API_URL}/api/GetNoiseHistory?limit=1000" | jq -r '.count')
echo "   $TOTAL registros"
echo ""

# 2. Últimos registros
echo "📝 Últimos 5 registros:"
curl -s "${API_URL}/api/GetNoiseHistory?limit=5" | jq -r '.data[] | "   • \(.deviceId): \(.decibels) dB - \(.timestamp)"'
echo ""

# 3. Dispositivos activos
echo "📱 Dispositivos activos:"
curl -s "${API_URL}/api/GetActiveDevices" | jq -r '.devices[] | "   • \(.deviceId): \(.totalRecords) registros (Promedio: \(.stats.average) dB)"'
echo ""

# 4. Estadísticas por dispositivo
echo "📈 Estadísticas detalladas:"
DEVICES=$(curl -s "${API_URL}/api/GetActiveDevices" | jq -r '.devices[].deviceId')
for device in $DEVICES; do
  echo ""
  echo "   Dispositivo: $device"
  curl -s "${API_URL}/api/GetDeviceStats?deviceId=$device" | jq -r '.stats | "     - Total: \(.count) registros\n     - Promedio: \(.average) dB\n     - Máximo: \(.max) dB\n     - Mínimo: \(.min) dB"'
done

echo ""
echo "✅ Verificación completada!"
echo ""
echo "💡 Para ver los datos en Azure Portal:"
echo "   1. Ve a: https://portal.azure.com"
echo "   2. Busca: babymonitor-cosmos-dev-2i4eazaehynzs"
echo "   3. Data Explorer → BabyMonitorDB → NoiseData → Items"

