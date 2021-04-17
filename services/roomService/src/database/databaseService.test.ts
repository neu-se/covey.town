import db from './knexfile';
import {
  logUser,
  setUserNames,
  getAllUserInfo,
  getCurrentAvatar,
  updateAvatar,
  deleteUser,
  saveTown,
  getSavedTowns,
  unsaveTown,
  getAllTowns,
  getPublicTowns,
  addNewTown,
  deleteTown,
  updateTownName,
  updateTownPublicStatus,
  getTownByID,
  TownData,
} from './databaseService';



describe('UserCenteredDatabaseFunctions', () => {
  afterAll(async () => {
    await db('Users').where('email', 'TESTING').del()
  });
  it('should add new users to database', async () => {
    let count = await db('Users').where('email', 'TESTING').then((rows: any[]) =>
      rows.length);
    expect(count)
      .toBe(0);
    await logUser('TESTING');
    count = await db('Users').where('email', 'TESTING').then((rows: any[]) =>
      rows.length);
    expect(count)
      .toBe(1);
  });
  it('should add misa as the default avatar for a user', async () => {
    const avatar = await db('Users')
      .select('currentAvatar')
      .where('email', 'TESTING').then((rows: any[]) =>
        rows[0].currentAvatar);
    expect(avatar)
      .toBe('misa');
  });
  it('should update user information with given parameters', async () => {
    let { first, last } = await db('Users').where('email', 'TESTING').then((rows: any[]) => {
      return { first: rows[0].firstName, last: rows[0].lastName }
    });
    expect(first)
      .toBe(' ');
    expect(last)
      .toBe(' ');
    await setUserNames('TESTING', 'JOHN', 'DOE');
    let { first2, last2 } = await db('Users').where('email', 'TESTING').then((rows: any[]) => {
      return { first2: rows[0].firstName, last2: rows[0].lastName }
    });
    expect(first2)
      .toBe('JOHN');
    expect(last2)
      .toBe('DOE');
  });
  it('should return all user info for given user', async () => {
    const info = await getAllUserInfo('TESTING');
    expect(info.email)
      .toBe('TESTING');
    expect(info.currentAvatar)
      .toBe('misa');
    expect(info.firstName)
      .toBe('JOHN');
    expect(info.lastName)
      .toBe('DOE');
  });
});

describe('AvatarCenteredDatabaseFunctions', () => {
  beforeAll(async () => {
    await logUser('TESTING');
  });
  afterAll(async () => {
    await deleteUser('TESTING');
  })
  it('should grab current avatar for given user', async () => {
    const avatar = await getCurrentAvatar('TESTING');
    expect(avatar)
      .toBe('misa');
  });
  it('should allow for proper updating of an avatar', async () => {
    await updateAvatar('TESTING', 'catgirl');
    const avatar = await db('Users')
      .select('currentAvatar')
      .where('email', 'TESTING')
      .then((rows: any[]) => rows[0].currentAvatar);
    expect(avatar)
      .toBe('catgirl');
  });
});

describe('TownCenteredDatabaseFunctions', () => {
  beforeAll(async () => {
    await logUser('TESTING');
  });
  afterAll(async () => {
    await deleteUser('TESTING');
    await db.destroy();
  });
  it('should allow for a new town to be created by an existing user', async () => {
    let count = await db('Towns').select('coveyTownID').where('creator', 'TESTING').then((rows: any[]) => rows.length);
    expect(count)
      .toBe(0);
    await addNewTown('ID', 'PASSWORD', 'NAME', true, 'TESTING');
    let { num, ID } = await db('Towns').select('coveyTownID').where('creator', 'TESTING').then((rows: any[]) => {
      return { num: rows.length, ID: rows[0].coveyTownID }
    });
    expect(num)
      .toBe(1);
    expect(ID)
      .toBe('ID');
    try {
      await addNewTown('ID', 'PASSWORD', 'NAME', true, 'TESTING2');  // non existing user
    } catch (err) {
      // OK
    }
    count = await db('Towns').select('coveyTownID').where('creator', 'TESTING2').then((rows: any[]) => rows.length);
    expect(count)
      .toBe(0);
  });
  it('should allow for the friendlyName to be updated', async () => {
    let name = await db('Towns').select('friendlyName').where('creator', 'TESTING').then((rows: any[]) => rows[0].friendlyName);
    expect(name)
      .toBe('NAME');
    await updateTownName('ID', 'PASSWORD', 'NEW NAME');
    name = await db('Towns').select('friendlyName').where('creator', 'TESTING').then((rows: any[]) => rows[0].friendlyName);
    expect(name)
      .toBe('NEW NAME');
    // does not allow with incorrect password
    await updateTownName('ID', 'INCORRECT', 'NEWER NAME');
    name = await db('Towns').select('friendlyName').where('creator', 'TESTING').then((rows: any[]) => rows[0].friendlyName);
    expect(name)
      .toBe('NEW NAME');
  });
  it('should allow for the public status to be updated', async () => {
    let status = await db('Towns').select('isPublicallyListed').where('creator', 'TESTING').then((rows: any[]) => rows[0].isPublicallyListed);
    expect(status)
      .toBe(true);
    await updateTownPublicStatus('ID', 'PASSWORD', false);
    status = await db('Towns').select('isPublicallyListed').where('creator', 'TESTING').then((rows: any[]) => rows[0].isPublicallyListed);
    expect(status)
      .toBe(false);
    // does not allow with incorrect password
    await updateTownPublicStatus('ID', 'INCORRECT', true);
    status = await db('Towns').select('isPublicallyListed').where('creator', 'TESTING').then((rows: any[]) => rows[0].isPublicallyListed);
    expect(status)
      .toBe(false);
  });
  it('should retrieve all town data', async () => {
    const info = await getTownByID('ID');
    expect(info)
      .toBeDefined();
    if (info) {

      expect(info.coveyTownID)
        .toBe('ID');
      expect(info.coveyTownPassword)
        .toBe('PASSWORD');
      expect(info.friendlyName)
        .toBe('NEW NAME');
      expect(info.isPublicallyListed)
        .toBe(false);
    };
  });
  it('should delete specified towns with the correct password', async () => {
    await deleteTown('ID', 'WRONG PASSWORD');
    let count = await db('Towns').select('coveyTownID').where('creator', 'TESTING').then((rows: any[]) => rows.length);
    expect(count)
      .toBe(1);
    await deleteTown('ID', 'PASSWORD');
    count = await db('Towns').select('coveyTownID').where('creator', 'TESTING').then((rows: any[]) => rows.length);
    expect(count)
      .toBe(0);
  });
  it('should allow a user to save a town', async () => {
    let count = await db('SavedTowns').where('userEmail', 'TESTING').then((rows: any[]) => rows.length);
    expect(count)
      .toBe(0);
    await addNewTown('ID2', 'PASSWORD2', 'NAME2', true, 'TESTING');
    await saveTown('TESTING', 'ID2');
    let { num, id } = await db('SavedTowns').select('coveyTownID').where('userEmail', 'TESTING').then((rows: any[]) => {
      return { num: rows.length, id: rows[0].coveyTownID };
    });
    expect(num)
      .toBe(1);
    expect(id)
      .toBe('ID2');
  });
  it('should return all saved towns for a given user', async () => {
    await addNewTown('ID3', 'PASSWORD2', 'NAME2', true, 'TESTING');
    await saveTown('TESTING', 'ID3');
    const towns = await getSavedTowns('TESTING');
    expect(towns.length)
      .toBe(2);
    let town = towns.find(t => t.coveyTownID === 'ID2');
    expect(town)
      .toBeDefined();
    town = towns.find(t => t.coveyTownID === 'ID3');
    expect(town)
      .toBeDefined();
  });
  it('should allow for the removal of a saved town from a users saved towns', async () => {
    let towns = await getSavedTowns('TESTING');
    expect(towns.length)
      .toBe(2);
    await unsaveTown('TESTING', 'ID2');
    towns = await getSavedTowns('TESTING');
    expect(towns.length)
      .toBe(1);
    let town = towns.find(t => t.coveyTownID === 'ID2');
    expect(town)
      .toBeUndefined();
    town = towns.find(t => t.coveyTownID === 'ID3');
    expect(town)
      .toBeDefined();
  });
});
