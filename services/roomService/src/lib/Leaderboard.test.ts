import Player from "../types/Player";
import CoveyTownsStore from "./CoveyTownsStore";
import Leaderboard from "./Leaderboard";

describe('Leaderboard', () => {
    let testlb = new Leaderboard();

    const testPlayer = new Player('test player');
    const towns = CoveyTownsStore.getInstance();
    const town = towns.createTown('Test Town', true);

    beforeEach(() => {
        testlb.allScores = [
            { userID: '001', userName: 'user1', score: 5 },
            { userID: '002', userName: 'user2', score: 2 },
            { userID: '003', userName: 'user3', score: 1 },
            { userID: '004', userName: 'user4', score: 4 },
            { userID: '005', userName: 'user5', score: 1 },
            { userID: '006', userName: 'user6', score: 3 },
            { userID: '007', userName: 'user7', score: 6 },
            { userID: '008', userName: 'user8', score: 2 }
        ];
    });

    describe('addPlayerToLeaderboard', () => {
      it('Should add a given player to the leaderboard with a starting score of 0', () => {
        const leaderboard = town.leaderboard.allScores;
        // make sure player isn't on the leaderboard yet
        expect(leaderboard.filter((pinfo) => pinfo.userID == testPlayer.id).length).toBe(0);
        town.addPlayer(testPlayer);
        expect(leaderboard.filter((pinfo) => pinfo.userID == testPlayer.id).length).toBe(1);
        expect(leaderboard.filter((pinfo) => pinfo.userID == testPlayer.id)[0].userName).toBe(testPlayer.userName);
        expect(leaderboard.filter((pinfo) => pinfo.userID == testPlayer.id)[0].score).toBe(0);
      });
      it('Should do nothing if the added player is already in the room', () => {
        const initLB = town.leaderboard;
        // make sure player is on the leaderboard 
        expect(initLB.allScores.filter((pinfo) => pinfo.userID == testPlayer.id).length).toBe(1);
        town.leaderboard.addPlayerToLeaderboard(testPlayer);
        expect(town.leaderboard.allScores.filter((pinfo) => pinfo.userID == testPlayer.id).length).toBe(1);
        expect(initLB).toStrictEqual(town.leaderboard);
      });
    })

    describe('updateScore', () => {
      it('Should update the given userIDs score', () => {
        const userID = '006';
        const user = testlb.allScores.filter((userinfo) => userinfo.userID == userID);
        const initScore = user[0].score;
        testlb.updateScore(userID, 1);
        expect(user[0].score).toBe(initScore + 1);
        expect(user[0].userID).toBe(userID);
      });
      it('Should use the given score to update', async () => {
        const userID = '004';
        const user = testlb.allScores.filter((userinfo) => userinfo.userID == userID);
        const initScore = user[0].score;
        const score = 4;
        testlb.updateScore(userID, score);
        expect(user[0].score).toBe(initScore + score);
      });
    });
  
    describe('getTopScores', () => {
      it('Should return max 10 scores', () => {
        const player1 = new Player('test player 1');
        const player2 = new Player('test player 2');
        const player3 = new Player('test player 3');

        testlb.addPlayerToLeaderboard(player1);
        testlb.addPlayerToLeaderboard(player2);
        testlb.addPlayerToLeaderboard(player3);
        expect(testlb.allScores.length).toBeGreaterThan(10);
        const leaderboard = testlb.getTopScores();
        expect(leaderboard.length).toBe(10);
      });
      it('Should be in descending order', async () => {
        const leaderboard = testlb.getTopScores();

        for (let i = 0; i < leaderboard.length - 1; i++) {
          expect(leaderboard[i].score).toBeGreaterThanOrEqual(leaderboard[i+1].score);
        }
      });
      it('Should return usernames (as opposed to userIDs)', async () => {
        const leaderboard = testlb.getTopScores();
        const testPlayer = new Player('test player');

        testlb.addPlayerToLeaderboard(testPlayer);
        testlb.updateScore(testPlayer.id, leaderboard[0].score+5);

        expect(testlb.getTopScores()[0].userName).toBe(testPlayer.userName);
        expect(testlb.getTopScores()[0].userName).not.toBe(testPlayer.id);
      });
    });
  });