import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * This function exists solely to help satisfy the linter + typechecker when it looks over the
 * stubbed (not yet implemented by you) functions. Remove calls to it as you go.
 *
 * @param _args
 */
// eslint-disable-next-line
export function removeThisFunctionCallWhenYouImplementThis(_args1?: any, _args2?: any): Error {
  return new Error('Unimplemented');
}

// eslint-disable-next-line
export function logError(err: any): void {
  // eslint-disable-next-line no-console
  console.trace(err);
}

/**
 * Hash the user password.
 * @param password the user password
 * @returns hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Generate JWT token for each user want to signin
 * @param userName use for generate JWT token
 * @returns generated JWT token
 */
export async function signAccessToken(email: string): Promise<string> {
  return jwt.sign({ userName: email }, process.env.JWT_SECRET as string);
}

/**
 * Verify the JWT token
 * @param token user's JWT token
 * @returns userName if it is valid. And return undefined if it is not valid.
 */
export async function verifyAccessToken(
  token: string,
): Promise<string | jwt.JwtPayload | undefined> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded;
  } catch (err) {
    return undefined;
  }
}
