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
