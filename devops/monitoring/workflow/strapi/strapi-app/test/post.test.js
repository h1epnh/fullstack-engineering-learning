const fs = require("fs");
const { setupStrapi, cleanupStrapi } = require("./helpers/strapi");
const request = require("supertest");
beforeAll(async () => {
  await setupStrapi();
});
afterAll(async () => {
  await cleanupStrapi();
});
const mockData = {
  data: { fullname: "popoola" },
};
it("should return hello world", async () => {
  const response = await request(strapi.server.httpServer)
    .post("/api/articles")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .send(mockData)
    .then((data) => {
      expect(data.text).toContain("Getting started with strapi");
    });
});
