import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database/";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate an user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user name",
      email: "fake@email.com",
      password: "123123",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "fake@email.com",
      password: "123123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate a non existent user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "123123",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate with incorrect password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user name",
      email: "test@email.com",
      password: "123123",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "121212",
    });

    expect(response.status).toBe(401);
  });
});
