import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database/";

let connection: Connection;

describe("Show User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show an authenticated user profile", async () => {
    await request(app).post("/api/v1/users").send({
      name: "test show user",
      email: "showuser@test.com",
      password: "123123",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "showuser@test.com",
      password: "123123",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.email).toEqual("showuser@test.com");
  });

  it("should not be able to list a non-existent user", async () => {
    const response = await request(app).get("/api/v1/profile").send().set({
      Authorization: "invalidToken",
    });

    expect(response.status).toBe(401);
  });
});
