/* 
    An object representing the leaderboard, which shows the top scores in each town.
**/
export default class Leaderboard {

     private _allScores: Map<string, number> = new Map([
         ['user1', 5],
         ['user2', 3],
         ['user3', 6]
     ]);

     get allScores(): Map<string, number> {
        return this._allScores;
    }

    set allScores(scores) {
        this._allScores = scores;
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
    getTopScores(): [string, number][] {
        let topScores: [string, number][] = [];
        let allScoreValues: [string, number][] = [];

        const allScores = this.allScores;

        for (let user in allScores.keys()) {
            let userScore = allScores.get(user);
            if (typeof userScore !== 'undefined') {
                allScoreValues.push([user, userScore]);
            }
        }

        const scores = Object.values(topScores).sort((score1, score2) => {
            return score2[1] - score1[1];
        });

        topScores = scores.slice(0,10);

        return topScores;
    }
}