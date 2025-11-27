const { getClient } = require('../cosmosRestClient');

module.exports = async function (context, req) {
  context.log('GetNoiseHistory function triggered');

  try {
    const deviceId = req.query.deviceId;
    const limit = parseInt(req.query.limit || '50');

    const client = getClient();

    let querySpec = {
      query: 'SELECT * FROM c',
      parameters: [],
    };

    if (deviceId) {
      querySpec = {
        query: 'SELECT * FROM c WHERE c.deviceId = @deviceId',
        parameters: [{ name: '@deviceId', value: deviceId }],
      };
    }

    const { resources: items } = await client.query(querySpec);

    const sortedItems = items
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    context.log(`Retrieved ${sortedItems.length} noise records`);

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true, count: sortedItems.length, data: sortedItems },
    };
  } catch (error) {
    context.log.error('Error retrieving noise history:', error);
    context.res = {
      status: 500,
      body: { error: 'Internal server error', message: error.message },
    };
  }
};
