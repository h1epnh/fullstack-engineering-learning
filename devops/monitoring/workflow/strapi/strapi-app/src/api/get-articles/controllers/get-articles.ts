'use strict';

/**
 * A set of functions called "actions" for `get-articles`
 */

module.exports = {
  getArticles: async (ctx, next) => {
    try {
      const data = await strapi
        .service("api::get-articles.get-articles")
        .getArticles();
      console.log("Data", data);
      ctx.body = data;
    } catch (err) {
      ctx.badRequest("Get articles controller error", { moreDetails: err });
    }
  }
};