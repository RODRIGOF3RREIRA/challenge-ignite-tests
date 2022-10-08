export default {
  clearMocks: true,
  rootDir: "./",
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts",
    "!<rootDir>/src/**/config/**",
    "!<rootDir>/src/**/database/**",
    "!<rootDir>/src/**/app/**",
    "!<rootDir>/src/app.ts",
    "!<rootDir>/src/server.ts",
    "!<rootDir>/src/**/@types/**",
    "!<rootDir>/src/**/entities/**",
    "!<rootDir>/src/**/mappers/**",
    "!<rootDir>/src/**/in-memory/**",
    "!<rootDir>/src/**/routes/**",
    "!<rootDir>/src/**/shared/**",
    "!<rootDir>/src/**/IStatementsRepository.ts/**",
    "!<rootDir>/src/**/CreateStatementError.ts/**",
    "!<rootDir>/src/**/ICreateStatementDTO.ts/**",
    "!<rootDir>/src/**/GetBalanceError.ts/**",
    "!<rootDir>/src/**/IGetBalanceDTO.ts/**",
    "!<rootDir>/src/**/GetStatementOperationError.ts/**",
    "!<rootDir>/src/**/IGetStatementOperationDTO.ts/**",
    "!<rootDir>/src/**/IUsersRepository.ts/**",
    "!<rootDir>/src/**/IAuthenticateUserResponseDTO.ts/**",
    "!<rootDir>/src/**/IncorrectEmailOrPasswordError.ts/**",
    "!<rootDir>/src/**/CreateUserError.ts/**",
    "!<rootDir>/src/**/ICreateUserDTO.ts/**",
    "!<rootDir>/src/**/ShowUserProfileError.ts/**",
  ],

  collectCoverage: true,

  coverageDirectory: "./coverage",

  coverageProvider: "v8",

  preset: "ts-jest",

  testMatch: ["**/*.spec.ts"],
};
