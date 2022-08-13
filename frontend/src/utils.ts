export function getJwtToken() {
  return sessionStorage.getItem('jwt');
}

export function setJwtToken(token: string) {
  sessionStorage.setItem('jwt', token);
}
