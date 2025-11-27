const { getClient } = require('../cosmosRestClient');

module.exports = async function (context, req) {
  context.log('GetActiveDevices function triggered');

  try {
    const hours = parseInt(req.query.hours || '24');
    const client = getClient();

    const { resources: items } = await client.query({
      query: 'SELECT * FROM c',
    });

    if (items.length === 0) {
      context.res = {
        status: 200,
        body: {
          success: true,
          count: 0,
          devices: [],
          message: 'No devices found',
        },
      };
      return;
    }

    const deviceMap = new Map();
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    items.forEach((item) => {
      const deviceId = item.deviceId;
      const itemDate = new Date(item.timestamp);

      if (!deviceMap.has(deviceId)) {
        deviceMap.set(deviceId, {
          deviceId,
          totalRecords: 0,
          recentRecords: 0,
          latestRecord: null,
          latestTimestamp: null,
          maxDecibels: 0,
          minDecibels: Infinity,
          isActive: false,
          decibelsSum: 0,
        });
      }

      const device = deviceMap.get(deviceId);
      device.totalRecords++;
      device.decibelsSum += item.decibels;

      if (itemDate >= cutoffTime) {
        device.recentRecords++;
        device.isActive = true;
      }

      if (
        !device.latestTimestamp ||
        itemDate > new Date(device.latestTimestamp)
      ) {
        device.latestTimestamp = item.timestamp;
        device.latestRecord = {
          decibels: item.decibels,
          timestamp: item.timestamp,
        };
      }

      device.maxDecibels = Math.max(device.maxDecibels, item.decibels);
      device.minDecibels = Math.min(device.minDecibels, item.decibels);
    });

    const devices = Array.from(deviceMap.values()).map((device) => ({
      deviceId: device.deviceId,
      isActive: device.isActive,
      totalRecords: device.totalRecords,
      recentRecords: device.recentRecords,
      latestRecord: device.latestRecord,
      stats: {
        average: (device.decibelsSum / device.totalRecords).toFixed(2),
        max: device.maxDecibels,
        min: device.minDecibels === Infinity ? 0 : device.minDecibels,
      },
    }));

    devices.sort(
      (a, b) =>
        new Date(b.latestRecord.timestamp) - new Date(a.latestRecord.timestamp)
    );

    context.log(
      `Found ${devices.length} devices (${
        devices.filter((d) => d.isActive).length
      } active)`
    );

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: true,
        count: devices.length,
        activeCount: devices.filter((d) => d.isActive).length,
        timeWindow: `Last ${hours} hours`,
        devices,
      },
    };
  } catch (error) {
    context.log.error('Error getting active devices:', error);
    context.res = {
      status: 500,
      body: { error: 'Internal server error', message: error.message },
    };
  }
};
