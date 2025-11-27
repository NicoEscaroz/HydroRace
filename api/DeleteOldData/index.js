const { getClient } = require('../cosmosRestClient');

module.exports = async function (context, req) {
  context.log('DeleteOldData function triggered');

  try {
    const days = parseInt(req.query.days || '30');
    const dryRun = req.query.dryRun === 'true';

    if (days < 1) {
      context.res = {
        status: 400,
        body: { error: 'days parameter must be at least 1' },
      };
      return;
    }

    const client = getClient();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffISOString = cutoffDate.toISOString();

    const { resources: oldItems } = await client.query({
      query: 'SELECT * FROM c WHERE c.timestamp < @cutoffDate',
      parameters: [{ name: '@cutoffDate', value: cutoffISOString }],
    });

    if (oldItems.length === 0) {
      context.res = {
        status: 200,
        body: {
          success: true,
          message: `No records found older than ${days} days`,
          deleted: 0,
          cutoffDate: cutoffISOString,
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
          message: `Would delete ${oldItems.length} records older than ${days} days`,
          wouldDelete: oldItems.length,
          cutoffDate: cutoffISOString,
          oldestRecord: oldItems[0],
          sample: oldItems.slice(0, 5),
        },
      };
      return;
    }

    let deletedCount = 0;
    const errors = [];

    for (const item of oldItems) {
      try {
        await client.delete(item.id, item.deviceId);
        deletedCount++;
      } catch (error) {
        context.log.error(`Error deleting item ${item.id}:`, error);
        errors.push({ id: item.id, error: error.message });
      }
    }

    context.log(
      `Deleted ${deletedCount} out of ${oldItems.length} old records`
    );

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: true,
        message: `Deleted ${deletedCount} records older than ${days} days`,
        deleted: deletedCount,
        failed: errors.length,
        cutoffDate: cutoffISOString,
        errors: errors.length > 0 ? errors : undefined,
      },
    };
  } catch (error) {
    context.log.error('Error deleting old data:', error);
    context.res = {
      status: 500,
      body: { error: 'Internal server error', message: error.message },
    };
  }
};
