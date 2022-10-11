import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let sut: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    sut = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to authenticate an user", async () => {
    const user = {
      name: "Name user",
      email: "email@test.com",
      password: "123123",
    };

    await createUserUseCase.execute(user);

    const result = await sut.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty("token");
  });

  it("should not be able to authenticate a non existent user", async () => {
    await expect(
      sut.execute({
        email: "test@gmail.com",
        password: "123123",
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });
