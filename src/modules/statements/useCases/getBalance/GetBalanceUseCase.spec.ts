import { verify } from "jsonwebtoken";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

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

describe("Get Balance Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to show balance user", async () => {
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

    await createStatementUseCase.execute(withdraw);

    const result = await getBalanceUseCase.execute({ user_id });

    expect(result.balance).toBe(400);
    expect(result.statement.length).toBe(2);
  });

  it("should not be able to list balance a non existent user", async () => {
    const user_id = "invalidUser";

    await expect(getBalanceUseCase.execute({ user_id })).rejects.toEqual(
      new GetBalanceError()
    );
  });
});
