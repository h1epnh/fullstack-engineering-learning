/**
 * A set of functions called "actions" for `combined-data`
 */

// src/api/combined-data/controllers/combined-data.js

'use strict';

module.exports = {
  async getCombinedData(ctx) {
    try {
      // Call the service to fetch and combine data
      const combinedData = await strapi.service('api::combined-data.combined-data').fetchCombinedData();

      // Set the response body
      ctx.body = combinedData;

    } catch (err) {
      // Handle errors gracefully
      ctx.status = 500;
      ctx.body = { error: 'Failed to fetch combined data', message: err.message };
      console.error(err); // Log the error for debugging
    }
  },
};