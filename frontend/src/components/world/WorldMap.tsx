import React, { useEffect, useState } from 'react';
import Phaser from 'phaser';
import Player, { Direction, UserLocation } from '../../classes/Player';
import Video from '../../classes/Video/Video';
import useCoveyAppState from '../../hooks/useCoveyAppState';

// https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
class CoveyGameScene extends Phaser.Scene {
  private player?: {
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, label: Phaser.GameObjects.Text
  };

  private id?: string;

  private players: Player[] = [];

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  private lastLocation?: UserLocation;

  private ready = false;

  private video: Video;

  private emitMovement: (loc: UserLocation) => void;

  constructor(video: Video, emitMovement: (loc: UserLocation)=>void) {
    super('PlayGame');
    this.video = video;
    this.emitMovement = emitMovement;
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
      let { location } = player;
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
      let { sprite } = myPlayer;
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

  update() {
    if (this.player && this.player && this.cursors) {
      const speed = 175;
      const prevVelocity = this.player.sprite.body.velocity.clone();
      const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;

      // Stop any previous movement from the last frame
      body.setVelocity(0);

      // Horizontal movement
      let primaryDirection: Direction = 'front';
      if (this.cursors.left?.isDown) {
        primaryDirection = 'left';
        body.setVelocityX(-speed);
      } else if (this.cursors.right?.isDown) {
        primaryDirection = 'right';
        body.setVelocityX(speed);
      }

      // Vertical movement
      if (this.cursors.up?.isDown) {
        primaryDirection = 'back';
        body.setVelocityY(-speed);
      } else if (this.cursors.down?.isDown) {
        primaryDirection = 'front';
        body.setVelocityY(speed);
      }

      // Normalize and scale the velocity so that player can't move faster along a diagonal
      this.player.sprite.body.velocity.normalize().scale(speed);

      let isMoving = true;
      // Update the animation last and give left/right animations precedence over up/down animations
      if (this.cursors.left?.isDown) {
        this.player.sprite.anims.play('misa-left-walk', true);
      } else if (this.cursors.right?.isDown) {
        this.player.sprite.anims.play('misa-right-walk', true);
      } else if (this.cursors.up?.isDown) {
        this.player.sprite.anims.play('misa-back-walk', true);
      } else if (this.cursors.down?.isDown) {
        this.player.sprite.anims.play('misa-front-walk', true);
      } else {
        this.player.sprite.anims.stop();
        isMoving = false;

        // If we were moving, pick and idle frame to use
        if (prevVelocity.x < 0) this.player.sprite.setTexture('atlas', 'misa-left');
        else if (prevVelocity.x > 0) this.player.sprite.setTexture('atlas', 'misa-right');
        else if (prevVelocity.y < 0) this.player.sprite.setTexture('atlas', 'misa-back');
        else if (prevVelocity.y > 0) this.player.sprite.setTexture('atlas', 'misa-front');
      }
      this.player.label.setX(body.x);
      this.player.label.setY(body.y - 20);
      if (!this.lastLocation
                || this.lastLocation.x !== body.x
                || this.lastLocation.y !== body.y || this.lastLocation.rotation !== primaryDirection
                || this.lastLocation.moving !== isMoving) {
        if (!this.lastLocation) {
          this.lastLocation = {
            x: body.x, y: body.y, rotation: primaryDirection, moving: isMoving,
          };
        }
        this.lastLocation.x = body.x;
        this.lastLocation.y = body.y;
        this.lastLocation.rotation = primaryDirection;
        this.lastLocation.moving = isMoving;
        this.emitMovement(this.lastLocation);
      }
    }
  }

  create() {
    const map = this.make.tilemap({ key: 'map' });

    /* Parameters are the name you gave the tileset in Tiled and then the key of the
    tileset image in Phaser's cache (i.e. the name you used in preload)
     */
    const tileset = map.addTilesetImage('tuxmon-sample-32px-extruded', 'tiles');

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const belowLayer = map.createStaticLayer('Below Player', tileset, 0, 0);
    const worldLayer = map.createStaticLayer('World', tileset, 0, 0);
    worldLayer.setCollisionByProperty({ collides: true });
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
    this.player = { sprite, label };

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
    const { anims } = this;
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
        prefix: 'misa-right-walk.', start: 0, end: 3, zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-front-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-front-walk.', start: 0, end: 3, zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-back-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-back-walk.', start: 0, end: 3, zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    const camera = this.cameras.main;
    camera.startFollow(this.player.sprite);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cursors = this.input.keyboard.createCursorKeys();

    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, `Arrow keys to move\nCurrent town: ${this.video.townFriendlyName} (${this.video.coveyTownID})`, {
        font: '18px monospace',
        fill: '#000000',
        padding: { x: 20, y: 10 },
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
    emitMovement, players,
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
          gravity: { y: 0 }, // Top down game, so no gravity
        },
      },
    };

    const game = new Phaser.Game(config);
    if (video) {
      const newGameScene = new CoveyGameScene(video, emitMovement);
      setGameScene(newGameScene);
      game.scene.add('coveyBoard', newGameScene, true);
    }
    return () => {
      game.destroy(true);
    };
  }, [video, emitMovement]);

  const deepPlayers = JSON.stringify(players);
  useEffect(() => {
    gameScene?.updatePlayersLocations(players);
  }, [players, deepPlayers, gameScene]);

  return <div id="map-container" />;
}
