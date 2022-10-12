import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";

import { verify } from "jsonwebtoken";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

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

describe("list a statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to list an statement", async () => {
    await createUserUseCase.execute(makeUser);

    const userAuthenticated = await authenticateUserUseCase.execute({
      email: makeUser.email,
      password: makeUser.password,
    });

    const { sub: user_id } = verify(
      userAuthenticated.token,
      "5eea5555d10a2d4be645930d0d0c5f91"
    ) as IPayload;

    const statement = await inMemoryStatementsRepository.create({
      user_id,
      amount: 500,
      description: "deposit test",
      type: "deposit" as OperationType,
    });

    const statement_id = statement.id as string;

    const result = await getStatementOperationUseCase.execute({
      user_id,
      statement_id,
    });

    expect(result).toHaveProperty("type");
    expect(result.amount).toBe(500);
    expect(result).toHaveProperty("id");
  });

  it("should not be able to view a statement a non existent user", async () => {
    const user_id = "invalidUser";

    const statement = await inMemoryStatementsRepository.create({
      user_id,
      amount: 500,
      description: "deposit test",
      type: "deposit" as OperationType,
    });

    const statement_id = statement.id as string;

    await expect(
      getStatementOperationUseCase.execute({ user_id, statement_id })
    ).rejects.toEqual(new GetStatementOperationError.UserNotFound());
  });

  it("should not be able to view a non existent statement", async () => {
    await createUserUseCase.execute(makeUser);

    const userAuthenticated = await authenticateUserUseCase.execute({
      email: makeUser.email,
      password: makeUser.password,
    });

    const { sub: user_id } = verify(
      userAuthenticated.token,
      "5eea5555d10a2d4be645930d0d0c5f91"
    ) as IPayload;

    const statement_id = "invalidStatement";

    await expect(
      getStatementOperationUseCase.execute({ user_id, statement_id })
    ).rejects.toEqual(new GetStatementOperationError.StatementNotFound());
  });
});
