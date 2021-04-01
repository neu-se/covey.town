import {nanoid} from 'nanoid';
import { HangmanPlayer2Move, HangmanWord, Limb } from '../client/Types';
import IGame from './IGame';

export default class HangmanGame implements IGame {
  private _id: string = nanoid();

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  gameState: string;

  player1ID: string;

  player2ID: string;

  alreadyGuessed : string[];

  limbList : Limb[];

  finalWord: string;

  splitWord : string[];

  constructor(player1ID:string, initialGameData: HangmanWord ) {
    this.gameState = this.initializeGame();
    this.player1ID = player1ID;
    this.finalWord = initialGameData.word;
    this.player2ID = '';
    this.alreadyGuessed = [];
    this.limbList = [Limb.RightLeg, Limb.LeftLeg, Limb.RightArm, Limb.LeftArm, Limb.Back, Limb.Head];
    this.splitWord = this.finalWord.split('');
  }

  checkLists(list1 : any[], list2 : any[]) : boolean {
    let twoContainsOne = true;
    list1.forEach(element => {
      twoContainsOne = twoContainsOne && list2.find(e => {e === element;});
    });
    let oneContainsTwo = true;
    list2.forEach(element => {
      oneContainsTwo = oneContainsTwo && list1.find(e => {e === element;});
    });
    return twoContainsOne && oneContainsTwo;
  }

  initializeGame(initialGameData?: string): string {
    return 'Choose a letter!';
  }

  splitFinalWord(splitWord:string[]) : string[] {
    const splitStringNoDupes: string[] = [];
    this.splitWord.forEach((item, index) => { if (splitWord.indexOf(item) === index) splitStringNoDupes.push(item); });
    return splitStringNoDupes;
  }

  limbToString(limb : Limb): string {
    if (limb === Limb.Head) { return 'Head';}
    if (limb === Limb.Back) {return 'Back';}
    if (limb === Limb.LeftArm) {return 'LeftArm';}
    if (limb === Limb.RightArm) {return 'RightArm';}
    if (limb === Limb.LeftLeg) {return 'LeftLeg';}
    if (limb === Limb.RightLeg) {return 'RightLeg';}
    return '';
  }

  move(move : HangmanPlayer2Move): string {
    if (this.alreadyGuessed.find(e => e === move.letter)) {
      return 'You already guessed that letter - make another guess!';
    }
    if (this.alreadyGuessed.find(e => e === this.finalWord)) {
      this.alreadyGuessed.push(move.letter);
      // this.splitWord.forEach((letter, index) => { if (letter === move.letter) this.splitWord.splice(index, 1)});
      this.splitWord = this.splitWord.filter(letter => letter !== move.letter);
      this.isGameOver();
      return 'Good job - you got a letter!';
    }
    this.alreadyGuessed.push(move.letter);
    const limb = <Limb> this.limbList.pop();
    this.isGameOver;
    return this.limbToString(limb);

  }


  isGameOver(): boolean {
    if (this.limbList.length === 0) {
      this.finishGame(this.player1ID);
      return true;
    }
    if (this.splitWord.length === 0) {
      this.finishGame(this.player2ID);
      return true;
    } return false;

  }


  finishGame(winningPlayerID: string): string {
    return `${winningPlayerID} won!\n${this.gameState}`;
  }


  playerJoin(player2ID: string): void {
    if (this.player2ID === '') {
      this.player2ID = player2ID;
    } else {
      throw new Error('Game is already full');
    }
  }



}
