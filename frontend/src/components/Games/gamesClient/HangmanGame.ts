import { customAlphabet } from 'nanoid';
import { HangmanPlayer2Move, HangmanWord, Limb } from './GameTypes';
import IGame from './IGame';

export default class HangmanGame implements IGame {
  friendlyNanoID = customAlphabet('1234567890ABCDEF', 8);

  id: string = 'hangman'.concat(this.friendlyNanoID());

  townID: string;

  gameState: string;

  player1ID: string;

  player1Username: string;

  player2ID: string;

  player2Username: string;

  alreadyGuessed : string[];

  limbList : Limb[];

  finalWord: string;

  splitWord : string[];

  gameStartMessage : string;

  head : string;

  back : string;

  leftArm : string;

  rightArm : string;

  leftLeg : string;

  rightLeg : string;


  constructor(player1ID:string, player1Username:string, initialGameData: HangmanWord, townID: string ) {
    this.townID = townID;
    this.gameStartMessage = 'Choose a letter!';
    this.gameState = this.initializeGame();
    this.player1ID = player1ID;
    this.player1Username = player1Username;
    this.finalWord = initialGameData.word;
    this.player2ID = '';
    this.player2Username = '';
    this.alreadyGuessed = [];
    this.limbList = [Limb.RightLeg, Limb.LeftLeg, Limb.RightArm, Limb.LeftArm, Limb.Back, Limb.Head];
    this.splitWord = this.finalWord.split('');
    this.head = 'Head';
    this.back = 'Back';
    this.leftArm = 'LeftArm';
    this.rightArm = 'RightArm';
    this.leftLeg = 'LeftLeg';
    this.rightLeg = 'RightLeg';
  }


  initializeGame(): string {
    return this.gameStartMessage;
  }

  limbToString(limb : Limb): string {
    if (limb === Limb.Head) {
      return this.head;
    } if (limb === Limb.Back) {
      return this.back;
    } if (limb === Limb.LeftArm) {
      return this.leftArm;
    } if (limb === Limb.RightArm) {
      return this.rightArm;
    } if (limb === Limb.LeftLeg) {
      return this.leftLeg;
    } if (limb === Limb.RightLeg) {
      return this.rightLeg;
    }
    return '';
  }

  move(move : HangmanPlayer2Move): string {
    if (this.alreadyGuessed.find(e => e === move.letter)) {
      return 'You already guessed that letter - make another guess!';
    }
    if (this.splitWord.find(e => e === move.letter)) {
      this.alreadyGuessed.push(move.letter);
      this.splitWord = this.splitWord.filter(letter => letter !== move.letter);
      this.isGameOver();
      return 'Good job - you got a letter!';
    }
    this.alreadyGuessed.push(move.letter);
    const limb = this.limbList.pop();
    this.isGameOver();
    if (limb !== undefined) {
      return this.limbToString(limb);
    }
    return '';
  }


  isGameOver(): boolean {
    if (this.limbList.length === 0) {
      this.finishGame(this.player1ID);
      return true;
    }
    if (this.splitWord.length === 0) {
      this.finishGame(this.player2ID);
      return true;
    }
    return false;

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
