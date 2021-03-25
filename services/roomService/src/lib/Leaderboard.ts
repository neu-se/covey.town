import { ScoreList } from "../CoveyTypes";

/* 
    An object representing the leaderboard, which shows the top scores in each town.
**/
export default class Leaderboard {

    private _allScores: Map<string, number>;

    get allScores(): Map<string, number> {
        return this._allScores;
    }

    set allScores(scores) {
        this._allScores = scores;
    }

    constructor() {
        this._allScores = new Map([
            ['user1', 5],
            ['user2', 3],
            ['user3', 6]
       ]);
    }

    /**
     * Update the given player's score with the given number of points
     * 
     */
    updateScore(username: string, points: number) {
        const userPoints = this.allScores.get(username);

        if (typeof userPoints !== 'undefined') {
            this.allScores.set(username, userPoints + points);
        } else {
            this.allScores.set(username, points);
        }
    }

    /**
     * Gets just the top 10 scores in the room
     * 
     */
    getTopScores(): ScoreList {
        let topScores: { userName: string, score: number }[]  = [];
        let allScoreValues: { userName: string, score: number}[] = [];

        const allScores = this.allScores;

        allScores.forEach((value: number, key: string) => {
            allScoreValues.push({ userName: key, score: value });
        })

        // sort values
        Object.values(topScores).sort((score1, score2) => {
            return score2.score - score1.score;
        });

        topScores = allScoreValues.slice(0, 10);

        return topScores;
    }
}