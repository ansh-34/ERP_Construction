import bcrypt from 'bcryptjs';

export function hashPassword(password: string, saltRounds = 12): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
