
export default class BoundingBox {
    public x: number;

    public y: number;

    public width: number;

    public height: number;

    constructor(x: number, y: number, width: number, height: number) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
  
    public static fromSprite(sprite: Phaser.GameObjects.Sprite): BoundingBox {
      return {
        x: sprite.x,
        y: sprite.y,
        width: sprite.displayWidth,
        height: sprite.displayHeight,
      };
    }
  }