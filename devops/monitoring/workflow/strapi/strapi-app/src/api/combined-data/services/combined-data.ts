/**
 * combined-data service
 */

// src/api/combined-data/services/combined-data.js

'use strict';

/**
 *  combined-data service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::combined-data.combined-data', () => ({
  async fetchCombinedData() {
    try {
      // 1. Fetch Articles with related data (populate relations)
      const articles = await strapi.entityService.findMany('api::article.article', {
        populate: ['category', 'author'], // Correct field name
      });

      // 2. Fetch All Categories (for example purposes)
      const categories = await strapi.entityService.findMany('api::category.category');

      // 3. Format the data (optional, but recommended)
      const formattedArticles = articles.map((article) => {
        return {
          id: article.id,
          title: article.title,
        //   content: article.content,
        //   category: article.category ? {
        //     id: article.category.id,
        //     name: article.category.Name,
        //     description: article.category.Description,
        //   } : null,
        //   author: article.author ? {
        //     id: article.author.id,
        //     name: article.author.Name,
        //     bio: article.author.Bio,
        //     avatar: article.author.Avatar ? article.author.Avatar.url : null,
        //   } : null,
        //   coverImage: article.coverImage ? article.coverImage.url : null,
        };
      });

      const formattedCategories = categories.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
      }));

      // 4. Return the combined data
      return {
        articles: formattedArticles,
        categories: formattedCategories,
      };

    } catch (err) {
      console.error('Error fetching combined data in service:', err);
      throw new Error('Error fetching combined data in service');
    }
  },
}));