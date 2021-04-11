import axios from 'axios';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';

dotenv.config();

const url = process.env.HASURA_SERVICE_URL;
const userId = nanoid();

async function fetchUser(id: string): Promise<GetUserById[]> {
  const response = await axios.post(
    `${url}/user/userId`,
    { userId: id },
    {
      headers: { 'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET },
    },
  );

  return response.data.CoveyTown_user_profile;
}

beforeAll(async () => {
  await axios.post(
    `${url}/auth0user`,
    {
      auth0_id: userId,
      name: `test-auth0-${userId}`,
      email: 'test@mail.com',
      picture: 'https://picsum.photos/id/100/300/300',
    },
    {
      headers: { 'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET },
    },
  );
});

afterAll(async () => {
  await axios.delete(`${url}/auth0user`, {
    headers: { 'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET },
    data: {
      auth0_id: userId,
    },
  });
});

describe('ValidAPIs', () => {
  const newUser = {
    bio: 'I’m an early bird and I’m a night owl so I’m wise and I have worms!',
    dob: new Date().toISOString(),
    is_public: true,
    located: 'Scranton, PA',
    hobbies: 'Improv, Stand-up',
    gender: 'Male',
    relationship_status: 'Single',
  };
  it('is creating a valid user', async () => {
    const response = await axios.post(
      `${url}/user`,
      { ...newUser, user_id: userId },
      {
        headers: { 'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET },
      },
    );
    expect(response.data).not.toBeNull();
    expect(response.data).not.toBeUndefined();
  });
  it('fetches the created user', async () => {
    const fetchResponse = await fetchUser(userId);

    expect(fetchResponse.length).toEqual(1);
    expect(fetchResponse[0].located).toEqual('Scranton, PA');
  });
  it('updates the created user', async () => {
    newUser.located = 'Boulder, CO';
    const updateResponse = await axios.patch(
      `${url}/user/userId`,
      { ...newUser, userId },
      {
        headers: { 'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET },
      },
    );
    expect(updateResponse.data.update_CoveyTown_user_profile.affected_rows);
    const fetchResponse = await fetchUser(userId);

    expect(fetchResponse.length).toEqual(1);
    expect(fetchResponse[0].located).toEqual('Boulder, CO');
  });
  it('is fetching all users', async () => {
    const response = await axios.get(`${url}/users`, {
      headers: { 'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET },
    });
    const g: GetUserById[] = response.data.CoveyTown_user_profile;

    expect(g.filter(profile => profile.user.name === `test-auth0-${userId}`)).toHaveLength(1);
  });
  it('deletes the created user', async () => {
    const response = await axios.delete(`${url}/user`, {
      headers: { 'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET },
      data: {
        userId,
      },
    });

    expect(response.data.delete_CoveyTown_user_profile.affected_rows).toEqual(1);

    // making sure that it is deleted
    const fetchAllResponse = await axios.get(`${url}/users`, {
      headers: { 'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET },
    });
    const g: GetUserById[] = fetchAllResponse.data.CoveyTown_user_profile;

    expect(g.filter(profile => profile.user.name === `test-auth0-${userId}`)).toHaveLength(0);
  });
});

interface GetUserById {
  bio: string;
  dob: string;
  is_public: boolean;
  located: string;
  hobbies: string;
  gender: string;
  relationship_status: string;
  created_at: string;
  updated_at: string;
  id: unknown;
  user: {
    email: string;
    name: string;
    picture: string;
  };
}
