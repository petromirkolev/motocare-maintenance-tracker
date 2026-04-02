export const validInput = {
  password: 'testingpass',
};

export const invalidInput = {
  email: 'invalidemail@',
  password: 'testingpass123',
  shortPassword: 'test',
  longPassword: 'test'.repeat(50),
};

export const invalidEmailInput = {
  invalidEmailEmpty: {
    value: '',
    testDescription: 'invalid empty email',
  },
  invalidWhitespacedEmail: {
    value: '    ',
    testDescription: 'invalid whitespaced email',
  },
  invalidEmailWithoutPrefix: {
    value: '@test.com',
    testDescription: 'invalid email without prefix',
  },
  invalidEmailWithoutTLD: {
    value: 'test@test',
    testDescription: 'invalid email without TLD',
  },
  invalidEmailWithoutDomain: {
    value: 'test@com',
    testDescription: 'invalid email without domain',
  },
  invalidEmailWithDisallowedChars: {
    value: '##@test.com',
    testDescription: 'invalid email with disallowed chars',
  },
};

export const invalidPasswordInput = {
  invalidPasswordEmpty: {
    value: '',
    testDescription: 'invalid empty password',
  },
  invalidEmptyWhitespacedPassword: {
    value: '    ',
    testDescription: 'invalid whitespaced password',
  },
  invalidTooShortPassword: {
    value: '1234',
    testDescription: 'invalid too short password',
  },
  invalidTooLongPassword: {
    value: '1234554321123455432112345543211234554321',
    testDescription: 'invalid too long password',
  },
};

export function uniqueEmail(prefix = 'motocare'): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
}

export function makeBike() {
  return {
    make: `Test Bike ${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    model: 'Tracer 9 GT',
    year: 2021,
    odo: 1000,
  };
}
