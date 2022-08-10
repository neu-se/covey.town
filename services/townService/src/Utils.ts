/* eslint @typescript-eslint/no-var-requires: "off" */
const bcrypt = require('bcryptjs');

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

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
