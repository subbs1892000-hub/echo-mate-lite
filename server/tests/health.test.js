const request = require("supertest");
const app = require("../app");

describe("GET /health", () => {
  it("returns application health information", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body).toHaveProperty("timestamp");
  });
});
