import { customAlphabet } from 'nanoid';
import { TTLPlayer2Move, TTLChoices } from './GameTypes';
import IGame from './IGame';

export default class TTLGame implements IGame {

  friendlyNanoID = customAlphabet('1234567890ABCDEF', 8);

  id: string = 'ttl'.concat(this.friendlyNanoID());

  townID: string;

  gameState: string;

  player1ID: string;

  player1Username: string;

  player2ID: string;

  player2Username: string;

  option1: string;

  option2 : string;

  option3: string;

  correctOption: number;


  alreadyGuessed : string[];

  constructor(player1ID:string, player1Username:string, initialGameData: TTLChoices, townID: string ) {
    this.townID = townID;
    this.player1ID = player1ID;
    this.player1Username = player1Username;
    this.option1 = initialGameData.choice1;
    this.option2 = initialGameData.choice2;
    this.option3 = initialGameData.choice3;
    this.correctOption = initialGameData.correctLie;
    this.gameState = this.initializeGame();
    this.player2ID = '';
    this.player2Username = '';
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
    if (this.alreadyGuessed.find(e => e === this.correctOption.toString())) {
      this.finishGame(this.player2ID);
      return true;
    }
    if (this.alreadyGuessed.length === 3) {
      this.finishGame(this.player1ID);
      return true;
    }  return false;
  }

  finishGame(winningPlayerID: string): string {
    return `${winningPlayerID} won!\n${this.gameState}`;
  }

  playerJoin(player2ID: string, player2Username: string): void {
    if (this.player2ID === '') {
      this.player2ID = player2ID;
      this.player2Username = player2Username;
    } else {
      throw new Error('Game is already full');
    }
  }

}
