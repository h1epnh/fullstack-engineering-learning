module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/get-articles',
      handler: 'get-articles.getArticles',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};