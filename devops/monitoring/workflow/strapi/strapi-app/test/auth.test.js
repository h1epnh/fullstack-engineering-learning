const fs = require("fs");
const { setupStrapi, cleanupStrapi } = require("./strapi");
const request = require("supertest");
beforeAll(async () => {
  await setupStrapi();
});
afterAll(async () => {
  await cleanupStrapi();
});
// user mock data
const mockUserData = {
  username: "tester",
  email: "tester@strapi.com",
  provider: "local",
  password: "1234abc",
  confirmed: true,
  blocked: null,
};
it("should login user and return jwt token", async () => {
  /** Creates a new user and save it to the database */
  await strapi.plugins["users-permissions"].services.user.add({
    ...mockUserData,
  });
  await request(strapi.server.httpServer)
    .post("/api/auth/local")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .send({
      identifier: mockUserData.email,
      password: mockUserData.password,
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      expect(data.body.jwt).toBeDefined();
    });
});
