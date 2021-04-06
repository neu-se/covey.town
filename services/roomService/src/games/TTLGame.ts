import TTLGameServiceClient from "../client/TTLGameServiceClient";
import { TicMove, TTLPlayer1Move, TTLPlayer2Move, HangmanPlayer1Move, HangmanPlayer2Move, TTLChoices } from "../client/Types";
import IGame from "./IGame";

export default class TTLGame implements IGame {

        gameState: string;
        player1ID: string;
        player2ID: string;
        option1: string;
        option2 : string;
        option3: string;
        correctOption: number;
        alreadyGuessed : number[];

        constructor(player1ID:string, initialGameData: TTLChoices ) {
            this.player1ID = player1ID;
            this.option1 = initialGameData.choice1;
            this.option2 = initialGameData.choice2;
            this.option3 = initialGameData.choice3;
            this.correctOption = initialGameData.correctLie;
            this.gameState = this.initializeGame();
            this.player2ID = '';
            this.alreadyGuessed = [];
            
        }
        initializeGame(): string {
            return `Your two truths and a lie options are:\nOption 1: ${this.option1}\nOption 2: ${this.option2}
            \nOption 3: ${this.option3}\nGuess which is the lie!`;
        }

        move(move: TTLPlayer2Move): void {
            this.alreadyGuessed.push(move.guess);
            this.isGameOver();
        }

        isGameOver(): boolean {
            if (this.alreadyGuessed.find(e => e === this.correctOption)) {
                this.finishGame(this.player2ID);
                return true;
            } 
            else if (this.alreadyGuessed.length == 3) {
                this.finishGame(this.player1ID);
                return true;    
            } else { return false;}
        }

        finishGame(winningPlayerID: string): string {
            return `${winningPlayerID} won!\n${this.gameState}`;
        }

        playerJoin(player2ID: string): void {
            if (this.player2ID == '') {
                this.player2ID = player2ID;
            } else {
                throw new Error("Game is already full");
            }
        }
    
}