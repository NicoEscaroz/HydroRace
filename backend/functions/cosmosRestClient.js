const crypto = require('crypto');

class CosmosRestClient {
  constructor() {
    this.endpoint = process.env.COSMOS_DB_ENDPOINT;
    this.key = process.env.COSMOS_DB_KEY;
    this.databaseId = process.env.COSMOS_DB_DATABASE || 'BabyMonitorDB';
    this.containerId = process.env.COSMOS_DB_CONTAINER || 'NoiseData';

    if (!this.endpoint || !this.key) {
      throw new Error('Cosmos DB credentials not configured');
    }

    this.baseUrl = this.endpoint.replace(/:\d+\/$/, '').replace(/\/$/, '');
  }

  getAuthorizationToken(verb, resourceType, resourceId, date) {
    const key = Buffer.from(this.key, 'base64');
    const text = `${verb.toLowerCase()}\n${resourceType.toLowerCase()}\n${resourceId}\n${date.toLowerCase()}\n\n`;
    const signature = crypto
      .createHmac('sha256', key)
      .update(text)
      .digest('base64');
    const masterToken = 'master';
    const tokenVersion = '1.0';
    return encodeURIComponent(
      `type=${masterToken}&ver=${tokenVersion}&sig=${signature}`
    );
  }

  async query(querySpec) {
    const date = new Date().toUTCString();
    const resourceType = 'docs';
    const resourceId = `dbs/${this.databaseId}/colls/${this.containerId}`;
    const authToken = this.getAuthorizationToken(
      'POST',
      resourceType,
      resourceId,
      date
    );
    const url = `${this.baseUrl}/dbs/${this.databaseId}/colls/${this.containerId}/docs`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authToken,
        'Content-Type': 'application/query+json',
        'x-ms-date': date,
        'x-ms-version': '2018-12-31',
        'x-ms-documentdb-isquery': 'true',
        'x-ms-documentdb-query-enablecrosspartition': 'true',
      },
      body: JSON.stringify(querySpec),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Cosmos DB query failed: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return { resources: data.Documents || [] };
  }

  async create(document) {
    const date = new Date().toUTCString();
    const resourceType = 'docs';
    const resourceId = `dbs/${this.databaseId}/colls/${this.containerId}`;
    const authToken = this.getAuthorizationToken(
      'POST',
      resourceType,
      resourceId,
      date
    );
    const url = `${this.baseUrl}/dbs/${this.databaseId}/colls/${this.containerId}/docs`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authToken,
        'Content-Type': 'application/json',
        'x-ms-date': date,
        'x-ms-version': '2018-12-31',
        'x-ms-documentdb-partitionkey': JSON.stringify([document.deviceId]),
      },
      body: JSON.stringify(document),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Cosmos DB create failed: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return { resource: data };
  }

  async delete(id, partitionKey) {
    const date = new Date().toUTCString();
    const resourceType = 'docs';
    const resourceId = `dbs/${this.databaseId}/colls/${this.containerId}/docs/${id}`;
    const authToken = this.getAuthorizationToken(
      'DELETE',
      resourceType,
      resourceId,
      date
    );
    const url = `${this.baseUrl}/dbs/${this.databaseId}/colls/${this.containerId}/docs/${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: authToken,
        'x-ms-date': date,
        'x-ms-version': '2018-12-31',
        'x-ms-documentdb-partitionkey': JSON.stringify([partitionKey]),
      },
    });

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text();
      throw new Error(
        `Cosmos DB delete failed: ${response.status} - ${errorText}`
      );
    }

    return { success: true };
  }
}

let client = null;

function getClient() {
  if (!client) {
    client = new CosmosRestClient();
  }
  return client;
}

module.exports = { getClient };

