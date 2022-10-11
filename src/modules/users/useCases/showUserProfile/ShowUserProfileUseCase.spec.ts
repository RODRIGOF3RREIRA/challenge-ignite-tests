import { verify } from "jsonwebtoken";
import authConfig from "../../../../config/auth";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
let inMemoryUsersRepository: InMemoryUsersRepository;
let sut: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

const { secret } = authConfig.jwt;

export const makeUser = {
  email: "test@test.com",
  name: "user test",
  password: "12345",
};

interface IPayload {
  sub: string;
}
describe("Show User Profile Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    sut = new ShowUserProfileUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to show profile an user", async () => {
    await createUserUseCase.execute(makeUser);

    const userAuthenticated = await authenticateUserUseCase.execute({
      email: makeUser.email,
      password: makeUser.password,
    });

    const { sub: user_id } = verify(
      userAuthenticated.token,
      secret
    ) as IPayload;

    const result = await sut.execute(user_id);

    expect(result).toHaveProperty("id");
    expect(result.email).toBe(makeUser.email);
    expect(result.name).toBe(makeUser.name);
  });

  it("should be not able to show profile a non existent user", async () => {
    expect(async () => {
      const id = "invalidId";
      await sut.execute(id);
    }).rejects.toEqual(new ShowUserProfileError());
  });
});
