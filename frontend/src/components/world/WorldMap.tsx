import React, {useEffect, useState} from 'react';
import Phaser from 'phaser';
import Player, {UserLocation} from '../../classes/Player';
import Video from '../../classes/Video/Video';
import useCoveyAppState from '../../hooks/useCoveyAppState';

// https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
class CoveyGameScene extends Phaser.Scene {


  private player?: {
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, label: Phaser.GameObjects.Text
  };

  private id?: string;

  private players: Player[] = [];

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys[] = [];

  private lastLocation?: UserLocation;

  private ready = false;

  private video: Video;

  private emitMovement: (loc: UserLocation) => void;

  private _isInFocus: boolean;

  set isInFocus(inFocus: boolean) {
    this._isInFocus = inFocus;
  }

  constructor(video: Video, emitMovement: (loc: UserLocation) => void, isInFocus: boolean) {
    super('PlayGame');
    this.video = video;
    this.emitMovement = emitMovement;
    this._isInFocus = isInFocus;
  }

  preload() {
    // this.load.image("logo", logoImg);
    this.load.image('tiles', '/assets/tilesets/tuxmon-sample-32px-extruded.png');
    this.load.tilemapTiledJSON('map', '/assets/tilemaps/tuxemon-town.json');
    this.load.atlas('atlas', '/assets/atlas/atlas.png', '/assets/atlas/atlas.json');
  }

  updatePlayersLocations(players: Player[]) {
    if (!this.ready) {
      this.players = players;
      return;
    }
    players.forEach((p) => {
      this.updatePlayerLocation(p);
    });
    // Remove disconnected players from board
    const disconnectedPlayers = this.players.filter(
      (player) => !players.find((p) => p.id === player.id),
    );
    disconnectedPlayers.forEach((disconnectedPlayer) => {
      if (disconnectedPlayer.sprite) {
        disconnectedPlayer.sprite.destroy();
        disconnectedPlayer.label?.destroy();
      }
    });
    // Remove disconnected players from list
    if (disconnectedPlayers.length) {
      this.players = this.players.filter(
        (player) => !disconnectedPlayers.find(
          (p) => p.id === player.id,
        ),
      );
    }
  }

  updatePlayerLocation(player: Player) {
    let myPlayer = this.players.find((p) => p.id === player.id);
    if (!myPlayer) {
      let {location} = player;
      if (!location) {
        location = {
          rotation: 'back',
          moving: false,
          x: 0,
          y: 0,
        };
      }
      myPlayer = new Player(player.id, player.userName, location);
      this.players.push(myPlayer);
    }
    if (this.id !== myPlayer.id && this.physics && player.location) {
      let {sprite} = myPlayer;
      if (!sprite) {
        sprite = this.physics.add
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - JB todo
          .sprite(0, 0, 'atlas', 'misa-front')
          .setSize(30, 40)
          .setOffset(0, 24);
        const label = this.add.text(0, 0, myPlayer.userName, {
          font: '18px monospace',
          fill: '#000000',
          backgroundColor: '#ffffff',
        });
        myPlayer.label = label;
        myPlayer.sprite = sprite;
      }
      if (!sprite.anims) return;
      sprite.setX(player.location.x);
      sprite.setY(player.location.y);
      myPlayer.label?.setX(player.location.x);
      myPlayer.label?.setY(player.location.y - 20);
      if (player.location.moving) {
        sprite.anims.play(`misa-${player.location.rotation}-walk`, true);
      } else {
        sprite.anims.stop();
        sprite.setTexture('atlas', `misa-${player.location.rotation}`);
      }
    }
  }

  getNewMovementDirection() {
    if (this.cursors.find(keySet => keySet.left?.isDown)) {
      return 'left';
    }
    if (this.cursors.find(keySet => keySet.right?.isDown)) {
      return 'right';
    }
    if (this.cursors.find(keySet => keySet.down?.isDown)) {
      return 'front';
    }
    if (this.cursors.find(keySet => keySet.up?.isDown)) {
      return 'back';
    }
    return undefined;
  }

  update() {
    if (this.player && this.cursors) {
      const speed = 175;
      const prevVelocity = this.player.sprite.body.velocity.clone();
      const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;

      // Stop any previous movement from the last frame
      body.setVelocity(0);

      const primaryDirection = this.getNewMovementDirection();

      if (this._isInFocus) {
        switch (primaryDirection) {
          case 'left':
            body.setVelocityX(-speed);
            this.player.sprite.anims.play('misa-left-walk', true);
            break;
          case 'right':
            body.setVelocityX(speed);
            this.player.sprite.anims.play('misa-right-walk', true);
            break;
          case 'front':
            body.setVelocityY(speed);
            this.player.sprite.anims.play('misa-front-walk', true);
            break;
          case 'back':
            body.setVelocityY(-speed);
            this.player.sprite.anims.play('misa-back-walk', true);
            break;
          default:
            // Not moving
            this.player.sprite.anims.stop();
            // If we were moving, pick and idle frame to use
            if (prevVelocity.x < 0) {
              this.player.sprite.setTexture('atlas', 'misa-left');
            } else if (prevVelocity.x > 0) {
              this.player.sprite.setTexture('atlas', 'misa-right');
            } else if (prevVelocity.y < 0) {
              this.player.sprite.setTexture('atlas', 'misa-back');
            } else if (prevVelocity.y > 0) this.player.sprite.setTexture('atlas', 'misa-front');
            break;
        }
      }


      // Normalize and scale the velocity so that player can't move faster along a diagonal
      this.player.sprite.body.velocity.normalize()
        .scale(speed);

      const isMoving = primaryDirection !== undefined;
      this.player.label.setX(body.x);
      this.player.label.setY(body.y - 20);
      if (!this.lastLocation
        || this.lastLocation.x !== body.x
        || this.lastLocation.y !== body.y || this.lastLocation.rotation !== primaryDirection
        || this.lastLocation.moving !== isMoving) {
        if (!this.lastLocation) {
          this.lastLocation = {
            x: body.x,
            y: body.y,
            rotation: primaryDirection || 'front',
            moving: isMoving,
          };
        }
        this.lastLocation.x = body.x;
        this.lastLocation.y = body.y;
        this.lastLocation.rotation = primaryDirection || 'front';
        this.lastLocation.moving = isMoving;
        this.emitMovement(this.lastLocation);
      }
    }
  }

  create() {
    const map = this.make.tilemap({key: 'map'});

    /* Parameters are the name you gave the tileset in Tiled and then the key of the
     tileset image in Phaser's cache (i.e. the name you used in preload)
     */
    const tileset = map.addTilesetImage('tuxmon-sample-32px-extruded', 'tiles');

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const belowLayer = map.createStaticLayer('Below Player', tileset, 0, 0);
    const worldLayer = map.createStaticLayer('World', tileset, 0, 0);
    worldLayer.setCollisionByProperty({collides: true});
    const aboveLayer = map.createStaticLayer('Above Player', tileset, 0, 0);
    /* By default, everything gets depth sorted on the screen in the order we created things.
     Here, we want the "Above Player" layer to sit on top of the player, so we explicitly give
     it a depth. Higher depths will sit on top of lower depth objects.
     */
    aboveLayer.setDepth(10);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    const spawnPoint = map.findObject('Objects',
      (obj) => obj.name === 'Spawn Point') as unknown as
      Phaser.GameObjects.Components.Transform;

    // Create a sprite with physics enabled via the physics system. The image used for the sprite
    // has a bit of whitespace, so I'm using setSize & setOffset to control the size of the
    // player's body.
    const sprite = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, 'atlas', 'misa-front')
      .setSize(30, 40)
      .setOffset(0, 24);
    const label = this.add.text(spawnPoint.x, spawnPoint.y - 20, '(You)', {
      font: '18px monospace',
      fill: '#000000',
      // padding: {x: 20, y: 10},
      backgroundColor: '#ffffff',
    });
    this.player = {
      sprite,
      label
    };

    this.emitMovement({
      rotation: 'front',
      moving: false,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - JB todo
      x: spawnPoint.x,
      y: spawnPoint.y,
    });

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    this.physics.add.collider(sprite, worldLayer);

    // Create the player's walking animations from the texture atlas. These are stored in the global
    // animation manager so any sprite can access them.
    const {anims} = this;
    anims.create({
      key: 'misa-left-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-left-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-right-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-right-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-front-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-front-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-back-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-back-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    const camera = this.cameras.main;
    camera.startFollow(this.player.sprite);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cursors.push(this.input.keyboard.createCursorKeys());
    this.cursors.push(this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    }));
    this.cursors.push(this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.H,
      down: Phaser.Input.Keyboard.KeyCodes.J,
      left: Phaser.Input.Keyboard.KeyCodes.K,
      right: Phaser.Input.Keyboard.KeyCodes.L
    }));

    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, `Arrow keys to move\nCurrent town: ${this.video.townFriendlyName} (${this.video.coveyTownID})`, {
        font: '18px monospace',
        fill: '#000000',
        padding: {
          x: 20,
          y: 10
        },
        backgroundColor: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(30);

    this.ready = true;
    if (this.players.length) {
      // Some players got added to the queue before we were ready, make sure that they have
      // sprites....
      this.players.forEach((p) => this.updatePlayerLocation(p));
    }
  }
}

export default function WorldMap(): JSX.Element {
  const video = Video.instance();
  const {
    emitMovement, players, isWorldMapFocused,
  } = useCoveyAppState();
  const [gameScene, setGameScene] = useState<CoveyGameScene>();
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      parent: 'map-container',
      minWidth: 800,
      minHeight: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: {y: 0}, // Top down game, so no gravity
        },
      },
    };

    const game = new Phaser.Game(config);
    if (video) {
      const newGameScene = new CoveyGameScene(video, emitMovement, isWorldMapFocused);
      setGameScene(newGameScene);
      game.scene.add('coveyBoard', newGameScene, true);
    }
    return () => {
      game.destroy(true);
    };
  }, [video, emitMovement]);
  useEffect(() => {
    if (gameScene) {
      console.log(isWorldMapFocused);
      gameScene.isInFocus = isWorldMapFocused || false;
    }
  }, [gameScene, isWorldMapFocused]);

  const deepPlayers = JSON.stringify(players);
  useEffect(() => {
    gameScene?.updatePlayersLocations(players);
  }, [players, deepPlayers, gameScene]);


  return <div id="map-container"/>;
}
