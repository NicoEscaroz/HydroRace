const { getClient } = require('../cosmosRestClient');

module.exports = async function (context, req) {
  context.log('ReceiveNoiseData function triggered');

  try {
    const { deviceId, decibels, timestamp } = req.body;

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      context.res = {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      };
      return;
    }

    if (!deviceId || decibels === undefined || !timestamp) {
      context.res = {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: {
          error: 'Missing required fields: deviceId, decibels, timestamp',
        },
      };
      return;
    }

    const noiseRecord = {
      id: `${deviceId}_${Date.now()}`,
      deviceId,
      decibels: parseFloat(decibels),
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const client = getClient();
    const { resource: createdItem } = await client.create(noiseRecord);

    context.log(`Noise data saved: ${JSON.stringify(createdItem)}`);

    context.res = {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: { success: true, data: createdItem },
    };
  } catch (error) {
    context.log.error('Error processing noise data:', error);
    context.res = {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: { error: 'Internal server error', message: error.message },
    };
  }
};
