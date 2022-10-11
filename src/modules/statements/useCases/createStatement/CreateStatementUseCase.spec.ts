import { verify } from "jsonwebtoken";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
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
});
