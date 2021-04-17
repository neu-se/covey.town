import dotenv from 'dotenv';
import { Client } from 'pg';
import { JoinedTown } from '../AccountTypes';

const config = dotenv.config();
const client = new Client({
  connectionString: process.env.DATABASE_CONNECTION_STRING || config.parsed?.DATABASE_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false,
  },
});

// makes a connection to the database and maintains it until the program ends
client.connect();

export type SavedUserInfoRequest = {
  userID: string;
  username?: string;
  email?: string;
  useAudio?: boolean;
  useVideo?: boolean;
  towns?: JoinedTown[];
};

/**
 * checks if a user already exists, if so, updates their account, otherwise creates a new user
 * RETURN type: {success: true/false}
 */
export async function upsertUser(userInfo: SavedUserInfoRequest): Promise<boolean> {
  try {
    const userPreferencesQuery = {
      name: 'UpsertUserPreferences',
      text: `INSERT INTO user_preferences AS up (user_id, email, username, use_audio, use_video)
            VALUES ($1, COALESCE($2, ''), COALESCE($3, ''), COALESCE($4, false), COALESCE($5, false))
            ON CONFLICT ON CONSTRAINT user_preferences_pkey
            DO
              UPDATE SET
                email = COALESCE($2, up.email),
                username = COALESCE($3, up.username),
                use_audio = COALESCE($4, up.use_audio),
                use_video = COALESCE($5, up.use_video)
              WHERE up.user_id = $1;`,
      values: [userInfo.userID, userInfo.email, userInfo.username, userInfo.useAudio, userInfo.useVideo],
    };

    await client.query(userPreferencesQuery);

    const townsQueries: any[] = [];
    userInfo.towns?.forEach(town => {
      const townsQuery = {
        name: 'UpsertTowns',
        text: `INSERT INTO towns AS t (user_id, town_id, position_x, position_y)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT ON CONSTRAINT uq_town
              DO
                UPDATE SET
                  position_x = $3,
                  position_y = $4
                WHERE t.user_id = $1 AND t.town_id = $2;`,
        values: [userInfo.userID, town.townID, town.positionX, town.positionY],
      };
      townsQueries.push(client.query(townsQuery));
    });

    Promise.all(townsQueries);

    return true;
  } catch (err) {
    return false;
  }
}

/**
 * gets user info given a user_id
 * RETURN type: AccountTypes.User interface
 */
export async function getUserByID(userID: string): Promise<SavedUserInfoRequest | undefined> {
  try {
    const query = {
      name: 'GetUserByID',
      text: `SELECT up.user_id,
                    up.email,
                    up.username,
                    up.use_audio,
                    up.use_video,
                    t.town_id,
                    t.position_x,
                    t.position_y
              FROM user_preferences up
              LEFT JOIN towns t ON up.user_id = t.user_id
              WHERE up.user_id = $1`,
      values: [userID],
    };

    let user: SavedUserInfoRequest | undefined;
    const response = await client.query(query);
    response.rows.forEach((row: any) => {
      if (user === undefined) {
        user = {
          userID: row.user_id,
          email: row.email,
          username: row.username,
          useAudio: row.use_audio,
          useVideo: row.use_video,
          towns: [],
        };
      }

      if (row.town_id) {
        user.towns?.push({
          townID: row.town_id,
          positionX: row.position_x,
          positionY: row.position_y,
        });
      }
    });

    return user;
  } catch (err) {
    return undefined;
  }
}

/**
 * removes all of a user's information, specified by their userID
 * RETURN type: {success: true/false}
 */
export async function resetUser(userID: string): Promise<boolean> {
  try {
    await client.query(`DELETE FROM towns WHERE user_id = '${userID}';`);
    await client.query(`UPDATE user_preferences SET username = '', use_audio = false, use_video = false WHERE user_id = '${userID}';`);

    return true;
  } catch (err) {
    return false;
  }
}

/**
 * deletes a user, specified by their userID
 * RETURN type: {success: true/false}
 */
export async function deleteUser(userID: string): Promise<boolean> {
  try {
    await client.query(`DELETE FROM towns WHERE user_id = '${userID}';`);
    await client.query(`DELETE FROM user_preferences WHERE user_id = '${userID}';`);

    return true;
  } catch (err) {
    return false;
  }
}
