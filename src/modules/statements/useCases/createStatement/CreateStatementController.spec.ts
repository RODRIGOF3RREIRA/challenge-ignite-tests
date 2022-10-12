import { Connection } from "typeorm";
import createConnection from "../../../../database";
let connection: Connection;
import request from "supertest";
import { app } from "../../../../app";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";

export const makeUser: ICreateUserDTO = {
  email: "test@statement.com",
  name: "statement test",
  password: "123456",
};

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send(makeUser);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new deposit", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: makeUser.email,
      password: makeUser.password,
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "deposit test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(200);
    expect(response.body.description).toBe("deposit test");
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to create a new deposit a non existent user", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "Deposit test",
      })
      .set({
        Authorization: "invalidToken",
      });

    expect(response.status).toBe(401);
  });

  it("should be able to create a new withdraw", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: makeUser.email,
      password: makeUser.password,
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "deposit test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "withdraw test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(100);
    expect(response.body.description).toBe("withdraw test");
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to create a new withdraw a non existent user", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "withdraw test",
      })
      .set({
        Authorization: "invalidToken",
      });

    expect(response.status).toBe(401);
  });

  it("should not be able to create a new withdraw with insufficient funds", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: makeUser.email,
      password: makeUser.password,
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "withdraw test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});
