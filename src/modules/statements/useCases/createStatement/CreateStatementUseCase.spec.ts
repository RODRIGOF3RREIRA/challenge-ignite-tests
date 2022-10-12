import { verify } from "jsonwebtoken";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryUserRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

interface IPayload {
  sub: string;
}

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

export const makeUser: ICreateUserDTO = {
  email: "test@statement.com",
  name: "statement test",
  password: "123456",
};

describe("Create Statement Use Case", () => {
  inMemoryUserRepository = new InMemoryUsersRepository();
  inMemoryStatementsRepository = new InMemoryStatementsRepository();

  createUserUseCase = new CreateUserUseCase(inMemoryUserRepository);
  authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUserRepository);
  createStatementUseCase = new CreateStatementUseCase(
    inMemoryUserRepository,
    inMemoryStatementsRepository
  );

  it("should be able to create a new deposit", async () => {
    await createUserUseCase.execute(makeUser);

    const userAuthenticated = await authenticateUserUseCase.execute({
      email: makeUser.email,
      password: makeUser.password,
    });

    const { sub: user_id } = verify(
      userAuthenticated.token,
      "5eea5555d10a2d4be645930d0d0c5f91"
    ) as IPayload;

    const deposit: ICreateStatementDTO = {
      user_id,
      amount: 500,
      description: "deposit test",
      type: "deposit" as OperationType,
    };

    const result = await createStatementUseCase.execute(deposit);

    expect(result).toHaveProperty("id");
    expect(result.type).toBe("deposit");
    expect(result.amount).toBe(500);
    expect(result.description).toEqual("deposit test");
  });

  it("should not be able to create a new deposit a non existent user", async () => {
    const deposit: ICreateStatementDTO = {
      user_id: "fake-user",
      amount: 500,
      description: "deposit test",
      type: "deposit" as OperationType,
    };

    await expect(createStatementUseCase.execute(deposit)).rejects.toEqual(
      new CreateStatementError.UserNotFound()
    );
  });

  it("should be able to create a new withdraw", async () => {
    await createUserUseCase.execute(makeUser);

    const userAuthenticated = await authenticateUserUseCase.execute({
      email: makeUser.email,
      password: makeUser.password,
    });

    const { sub: user_id } = verify(
      userAuthenticated.token,
      "5eea5555d10a2d4be645930d0d0c5f91"
    ) as IPayload;

    const deposit: ICreateStatementDTO = {
      user_id,
      amount: 500,
      description: "deposit test",
      type: "deposit" as OperationType,
    };

    await createStatementUseCase.execute(deposit);

    const withdraw: ICreateStatementDTO = {
      user_id,
      amount: 100,
      description: "withdraw test",
      type: "withdraw" as OperationType,
    };

    const result = await createStatementUseCase.execute(withdraw);

    expect(result).toHaveProperty("id");
    expect(result.type).toBe("withdraw");
    expect(result.amount).toBe(100);
    expect(result.description).toEqual("withdraw test");
  });

  it("should not be able to create a new withdraw a non existent user", async () => {
    const withdraw: ICreateStatementDTO = {
      user_id: "fake-user",
      amount: 500,
      description: "withdraw test",
      type: "withdraw" as OperationType,
    };

    await expect(createStatementUseCase.execute(withdraw)).rejects.toEqual(
      new CreateStatementError.UserNotFound()
    );
  });

  it("should not be able to create a new withdraw with insufficient funds", async () => {
    await createUserUseCase.execute(makeUser);

    const userAuthenticated = await authenticateUserUseCase.execute({
      email: makeUser.email,
      password: makeUser.password,
    });

    const { sub: user_id } = verify(
      userAuthenticated.token,
      "5eea5555d10a2d4be645930d0d0c5f91"
    ) as IPayload;

    const deposit: ICreateStatementDTO = {
      user_id,
      amount: 500,
      description: "deposit test",
      type: "deposit" as OperationType,
    };

    await createStatementUseCase.execute(deposit);

    const withdraw: ICreateStatementDTO = {
      user_id,
      amount: 800,
      description: "withdraw test",
      type: "withdraw" as OperationType,
    };

    await expect(createStatementUseCase.execute(withdraw)).rejects.toEqual(
      new CreateStatementError.InsufficientFunds()
    );
  });
});
