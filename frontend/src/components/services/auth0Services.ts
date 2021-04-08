export default async function changePassword(email: string) {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      "client_id": "jgJh7ejkWNLMjNAv1oMKVtuBYsoaYcRh",
      "email": email,
      "connection": "MongoDB",
    })
  };
  const response = await fetch('https://dev-fse.us.auth0.com/dbconnections/change_password', requestOptions);
  return response
}
