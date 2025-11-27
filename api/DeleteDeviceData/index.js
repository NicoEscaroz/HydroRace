const { getClient } = require('../cosmosRestClient');

module.exports = async function (context, req) {
  context.log('DeleteDeviceData function triggered');

  try {
    const deviceId = req.query.deviceId;
    const dryRun = req.query.dryRun === 'true';

    if (!deviceId) {
      context.res = {
        status: 400,
        body: { error: 'deviceId parameter is required' },
      };
      return;
    }

    const client = getClient();

    const { resources: deviceItems } = await client.query({
      query: 'SELECT * FROM c WHERE c.deviceId = @deviceId',
      parameters: [{ name: '@deviceId', value: deviceId }],
    });

    if (deviceItems.length === 0) {
      context.res = {
        status: 404,
        body: {
          success: false,
          message: `No records found for device: ${deviceId}`,
          deleted: 0,
        },
      };
      return;
    }

    if (dryRun) {
      context.res = {
        status: 200,
        body: {
          success: true,
          dryRun: true,
          message: `Would delete ${deviceItems.length} records for device: ${deviceId}`,
          wouldDelete: deviceItems.length,
          deviceId,
          dateRange: {
            oldest: deviceItems[0]?.timestamp,
            newest: deviceItems[deviceItems.length - 1]?.timestamp,
          },
          sample: deviceItems.slice(0, 5),
        },
      };
      return;
    }

    let deletedCount = 0;
    const errors = [];

    for (const item of deviceItems) {
      try {
        await client.delete(item.id, item.deviceId);
        deletedCount++;
      } catch (error) {
        context.log.error(`Error deleting item ${item.id}:`, error);
        errors.push({ id: item.id, error: error.message });
      }
    }

    context.log(
      `Deleted ${deletedCount} out of ${deviceItems.length} records for device ${deviceId}`
    );

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: true,
        message: `Deleted ${deletedCount} records for device: ${deviceId}`,
        deviceId,
        deleted: deletedCount,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    };
  } catch (error) {
    context.log.error('Error deleting device data:', error);
    context.res = {
      status: 500,
      body: { error: 'Internal server error', message: error.message },
    };
  }
};
