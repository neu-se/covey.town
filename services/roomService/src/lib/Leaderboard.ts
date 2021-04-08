import { ScoreList } from "../CoveyTypes";
import Player from "../types/Player";

/* 
    An object representing the leaderboard, which shows the top scores in each town.
**/
export default class Leaderboard {

    private _allScores: { userID: string, userName: string, score: number }[];

    get allScores(): { userID: string, userName: string, score: number }[] {
        return this._allScores;
    }

    set allScores(scores) {
        this._allScores = scores;
    }

    constructor() {
        this._allScores = [];

        // dummy data
        this._allScores = [
            { userID: '001', userName: 'user1', score: 2 },
            { userID: '002', userName: 'user2', score: 5 },
            { userID: '003', userName: 'user3', score: 3 }
        ];
    }

    addPlayerToLeaderboard(player: Player) {
        const players = this._allScores.filter((userinfo) => userinfo.userID == player.id);

        if (players.length > 0) {
            return;
        }

        this._allScores.push({ userID: player.id, userName: player.userName, score: 0 });
    }

    updateScore(userID: string, points: number) {
        this._allScores.map((userInfo) => {
                if (userInfo.userID == userID) {
                    userInfo.score += points;
                }
        });
    }

    /**
     * Gets just the top 10 scores in the room
     * 
     */
    getTopScores(): ScoreList {
        let allScoreValues: { userID: string, userName: string, score: number }[] = [];

        allScoreValues = this._allScores;

        // sort values
        allScoreValues.sort((score1, score2) => {
            return score2.score - score1.score;
        });

        const topScores: { userName: string, score: number }[]  = allScoreValues.slice(0, 10);

        return topScores;
    }
}