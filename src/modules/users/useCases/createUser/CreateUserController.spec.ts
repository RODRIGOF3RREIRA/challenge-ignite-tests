import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should ensure integration with CreateUserUseCase", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Name user",
      email: "email@test.com",
      password: "123123",
    });
    expect(response.status).toBe(201);
  });
});
