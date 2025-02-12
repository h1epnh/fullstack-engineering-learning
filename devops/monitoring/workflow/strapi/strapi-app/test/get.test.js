const fs = require("fs");
const { setupStrapi, cleanupStrapi } = require("./helpers/strapi");
const request = require("supertest");
beforeAll(async () => {
  await setupStrapi();
});
afterAll(async () => {
  await cleanupStrapi();
});
it("should return hello world", async () => {
  const response = await request(strapi.server.httpServer)
    .get("/api/articles")
    // .expect(200); // Expect response http code 200
    .then((data) => {
      expect(data.text).toContain("Strapi Tutorial");
    });
});
