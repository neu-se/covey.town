

export default class TicTacToe {

  private player1Id: string = ""; //x
  private player2Id: string = ""; //o

  private gameBoard = [[0,0,0],
              [0,0,0],
              [0,0,0]];

  private curPlayer:number  = 1; // who's turn is it
  private gameActive:boolean = false;
  private winningPlayer:string  = "";

startGame(player1: string, player2: string): void {
  if (player1 === '' || player2 === "" || player1 === player2) {
    throw Error("invalid players");
  }
  this.player1Id = player1;
  this.player2Id = player2;
  this.gameActive = true;
  this.resetGameBoard();
}

get isgameActive(): boolean {
  return this.gameActive;
}

get currentPlayer(): string{
  if(this.curPlayer == 1) {
    return this.player1Id;
  }
  else{
    return this.player2Id;

  }
}

private resetGameBoard(): void {
  this.gameBoard = [[0,0,0],
              [0,0,0],
              [0,0,0]];
}

getWinner(): string {
  if (this.winningPlayer == "") {
    throw  Error('no winner');
  }
  return this.winningPlayer;
}

// ask about this and not using copy
getBoard(): number[][] {
  return this.gameBoard;
}


private isFull(): boolean {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (this.gameBoard[i][j] == 0) {
        return false;
      }
    }
  }
  return true;
}

private setWinningPlayer(): void {
  this.winningPlayer = this.currentPlayer;
  }

private isWin(): Boolean {
// up and down
for (let i = 0; i < 3; i++) {
  if (this.gameBoard[i][0] == this.curPlayer && this.gameBoard[i][1] == this.curPlayer && this.gameBoard[i][2] == this.curPlayer) {
    this.setWinningPlayer();
    return true;
  }
  if (this.gameBoard[0][i] == this.curPlayer && this.gameBoard[1][i] == this.curPlayer && this.gameBoard[2][i] == this.curPlayer) {
    this.setWinningPlayer();
    return true;
  }
}
// diagonally
  if (this.gameBoard[0][0] == this.curPlayer && this.gameBoard[1][1] == this.curPlayer && this.gameBoard[2][2] == this.curPlayer) {
    this.setWinningPlayer();
    return true;
  }
  if (this.gameBoard[2][0] == this.curPlayer && this.gameBoard[1][1] == this.curPlayer && this.gameBoard[0][2] == this.curPlayer) {
    this.setWinningPlayer();
    return true;
  }

  return false;
}

makeMove(x:number, y:number): void {
  // check if move is valid/ game is current
  if (!this.gameActive) {
    throw new Error('game not active');
  }
  if (x>2 || x< 0 || y>2 || y< 0) {
    throw new Error('invalid x/y');
  }
  if (this.gameBoard[x][y] != 0) {
    throw new Error('choose a free space');
  }

  // make move since it is valid
  this.gameBoard[x][y] = this.curPlayer;

  // check if move won game/ if we can keep playing
  if (this.isWin()) {
    this.gameActive = false;

    // contact some listener
  }
  if (this.isFull()) {
    this.gameActive = false;

    // contact some listener
  }

  //change to next player
  this.curPlayer = this.curPlayer%2;
  this.curPlayer++;
}






}
