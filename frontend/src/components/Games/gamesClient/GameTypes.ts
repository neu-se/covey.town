export type HangmanWord = { word: string };
export type TTLChoices = { choice1: string, choice2: string, choice3: string, correctLie: number };

export type TTLPlayer2Move = { guess: string };
export type TTLPlayer1Move = { guessCorrect: boolean, correctAnswer?: string };
export type HangmanPlayer2Move = { letter: string };
export type HangmanPlayer1Move = { correct: boolean, finalWord?: string, limbLost: Limb };

export enum Limb {
  Head,
  Back,
  LeftArm,
  RightArm,
  LeftLeg,
  RightLeg,
}
