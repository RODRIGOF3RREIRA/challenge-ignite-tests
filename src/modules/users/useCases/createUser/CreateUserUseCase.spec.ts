import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "Name user",
      email: "email@test.com",
      password: "123123",
    });
    expect(user).toHaveProperty("id");
  });

  it("should not be able to create a new user with same email", async () => {
    const user: ICreateUserDTO = {
      name: "Name user",
      email: "email@test.com",
      password: "123123",
    };

    await createUserUseCase.execute(user);

    await expect(createUserUseCase.execute(user)).rejects.toEqual(
      new CreateUserError()
    );
  });
});
