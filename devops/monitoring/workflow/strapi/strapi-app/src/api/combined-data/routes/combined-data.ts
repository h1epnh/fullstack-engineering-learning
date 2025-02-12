// src/api/combined-data/routes/combined-data.js

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/combined-data',
      handler: 'api::combined-data.combined-data.getCombinedData',
      config: {
        auth: false, // Disable authentication for now.  REMOVE IN PRODUCTION!
        policies: [], // Add any policies here if needed
        middlewares: [], // Add any middlewares here if needed
      },
    },
  ],
};