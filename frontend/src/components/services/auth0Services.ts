export default async function changePassword() {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      "client_id": "jgJh7ejkWNLMjNAv1oMKVtuBYsoaYcRh",
      "email": "vaidehihshah2503@gmail.com",
      "connection": "MongoDB",
    })
  };
  const response = await fetch('https://dev-fse.us.auth0.com/dbconnections/change_password', requestOptions);
  return response
}
