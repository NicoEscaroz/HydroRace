const { getClient } = require('../cosmosRestClient');

module.exports = async function (context, req) {
  context.log('GetDeviceStats function triggered');

  try {
    const deviceId = req.query.deviceId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    if (!deviceId) {
      context.res = {
        status: 400,
        body: { error: 'deviceId parameter is required' },
      };
      return;
    }

    const client = getClient();

    let query = 'SELECT * FROM c WHERE c.deviceId = @deviceId';
    const parameters = [{ name: '@deviceId', value: deviceId }];

    if (startDate) {
      query += ' AND c.timestamp >= @startDate';
      parameters.push({ name: '@startDate', value: startDate });
    }

    if (endDate) {
      query += ' AND c.timestamp <= @endDate';
      parameters.push({ name: '@endDate', value: endDate });
    }

    const { resources: items } = await client.query({ query, parameters });

    if (items.length === 0) {
      context.res = {
        status: 200,
        body: {
          success: true,
          deviceId,
          stats: { count: 0, message: 'No data found for this device' },
        },
      };
      return;
    }

    const decibels = items.map((item) => item.decibels);
    const stats = {
      count: items.length,
      average: (decibels.reduce((a, b) => a + b, 0) / decibels.length).toFixed(
        2
      ),
      max: Math.max(...decibels),
      min: Math.min(...decibels),
      latest: items[items.length - 1],
      oldest: items[0],
      dateRange: {
        start: startDate || items[0].timestamp,
        end: endDate || items[items.length - 1].timestamp,
      },
    };

    context.log(
      `Stats calculated for device ${deviceId}: ${items.length} records`
    );

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { success: true, deviceId, stats },
    };
  } catch (error) {
    context.log.error('Error calculating device stats:', error);
    context.res = {
      status: 500,
      body: { error: 'Internal server error', message: error.message },
    };
  }
};
