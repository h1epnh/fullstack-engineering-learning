const fs = require("fs");
const { setupStrapi, cleanupStrapi } = require("./strapi");
beforeAll(async () => {
  await setupStrapi();
});
afterAll(async () => {
  await cleanupStrapi();
});
it("strapi is defined", () => {
  expect(strapi).toBeDefined();
});
