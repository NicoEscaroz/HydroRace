const { getClient } = require('../cosmosRestClient');

// Helper para convertir datos a CSV
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return 'deviceId,decibels,timestamp,createdAt\n';
  }

  const headers = 'deviceId,decibels,timestamp,createdAt\n';
  const rows = data.map(item => {
    const deviceId = (item.deviceId || '').replace(/,/g, '');
    const decibels = item.decibels || '';
    const timestamp = (item.timestamp || '').replace(/,/g, '');
    const createdAt = (item.createdAt || item.timestamp || '').replace(/,/g, '');
    return `${deviceId},${decibels},${timestamp},${createdAt}`;
  });

  return headers + rows.join('\n');
}

module.exports = async function (context, req) {
  context.log('ExportHistory function triggered');

  try {
    const deviceId = req.query.deviceId;
    const format = req.query.format || 'csv'; // csv o json
    const saveToStorage = req.query.saveToStorage === 'true';

    const client = getClient();

    // Obtener todos los datos (o filtrados por deviceId)
    let querySpec = {
      query: 'SELECT * FROM c',
      parameters: []
    };

    if (deviceId) {
      querySpec = {
        query: 'SELECT * FROM c WHERE c.deviceId = @deviceId',
        parameters: [{ name: '@deviceId', value: deviceId }]
      };
    }

    const { resources: items } = await client.query(querySpec);

    if (items.length === 0) {
      context.res = {
        status: 404,
        body: {
          success: false,
          message: 'No data found to export'
        }
      };
      return;
    }

    // Ordenar por timestamp
    const sortedItems = items.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    let fileContent;
    let fileName;
    let contentType;

    if (format === 'csv') {
      fileContent = convertToCSV(sortedItems);
      fileName = `noise-history-${deviceId || 'all'}-${Date.now()}.csv`;
      contentType = 'text/csv';
    } else {
      fileContent = JSON.stringify(sortedItems, null, 2);
      fileName = `noise-history-${deviceId || 'all'}-${Date.now()}.json`;
      contentType = 'application/json';
    }

    // Si se solicita guardar en Storage, intentar subirlo
    if (saveToStorage) {
      try {
        const storageConnectionString = process.env.STORAGE_CONNECTION_STRING;
        
        if (!storageConnectionString) {
          throw new Error('Storage connection string not configured');
        }

        // Parsear connection string
        const params = {};
        storageConnectionString.split(';').forEach(param => {
          const [key, value] = param.split('=');
          if (key && value) {
            params[key.toLowerCase()] = value;
          }
        });

        const accountName = params.accountname;
        const accountKey = params.accountkey;
        const endpointSuffix = params.endpointsuffix || 'core.windows.net';
        const containerName = 'exports';
        const blobName = fileName;

        // Crear container si no existe (usando REST API)
        const date = new Date().toUTCString();
        const containerUrl = `https://${accountName}.blob.${endpointSuffix}/${containerName}`;
        
        // Intentar crear container (puede fallar si ya existe, está bien)
        try {
          const containerStringToSign = [
            'PUT',
            '', '', '', '', '', '', '', '', '', '', '',
            `x-ms-date:${date}`,
            `x-ms-version:2021-04-10`,
            `/${accountName}/${containerName}`
          ].join('\n');

          const crypto = require('crypto');
          const containerSignature = crypto
            .createHmac('sha256', Buffer.from(accountKey, 'base64'))
            .update(containerStringToSign)
            .digest('base64');

          await fetch(containerUrl + '?restype=container', {
            method: 'PUT',
            headers: {
              'Authorization': `SharedKey ${accountName}:${containerSignature}`,
              'x-ms-date': date,
              'x-ms-version': '2021-04-10',
              'x-ms-blob-public-access': 'blob'
            }
          });
        } catch (e) {
          // Container ya existe o error, continuar
          context.log('Container creation skipped:', e.message);
        }

        // Subir blob
        const blobUrl = `https://${accountName}.blob.${endpointSuffix}/${containerName}/${blobName}`;
        const contentLength = Buffer.byteLength(fileContent, 'utf8');
        
        const blobStringToSign = [
          'PUT',
            '', '', contentLength, '', contentType, '', '', '', '', '', '',
            `x-ms-blob-type:BlockBlob`,
            `x-ms-date:${date}`,
            `x-ms-version:2021-04-10`,
            `/${accountName}/${containerName}/${blobName}`
        ].join('\n');

        const crypto = require('crypto');
        const blobSignature = crypto
          .createHmac('sha256', Buffer.from(accountKey, 'base64'))
          .update(blobStringToSign)
          .digest('base64');

        const uploadResponse = await fetch(blobUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `SharedKey ${accountName}:${blobSignature}`,
            'x-ms-date': date,
            'x-ms-version': '2021-04-10',
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': contentType,
            'Content-Length': contentLength.toString()
          },
          body: fileContent
        });

        if (uploadResponse.ok) {
          context.log(`File uploaded successfully: ${blobUrl}`);

          context.res = {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            },
            body: {
              success: true,
              message: `Exported ${sortedItems.length} records to Storage`,
              fileName: fileName,
              recordCount: sortedItems.length,
              format: format,
              downloadUrl: blobUrl,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
          };
          return;
        }
      } catch (storageError) {
        context.log.error('Storage upload error:', storageError);
        // Continuar para retornar contenido directamente
      }
    }

    // Retornar contenido directamente para descarga
    context.res = {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache'
      },
      body: fileContent
    };

  } catch (error) {
    context.log.error('Error exporting history:', error);
    
    context.res = {
      status: 500,
      body: {
        error: 'Internal server error',
        message: error.message
      }
    };
  }
};
