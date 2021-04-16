import React, { useEffect, useState } from 'react';
import Phaser from 'phaser';
import { useAuth0 } from '@auth0/auth0-react';
import { useToast } from '@chakra-ui/react';
import Player, { UserLocation } from '../../classes/Player';
import Video from '../../classes/Video/Video';
import useCoveyAppState from '../../hooks/useCoveyAppState';

// https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
class CoveyGameScene extends Phaser.Scene {
  private player?: {
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, label: Phaser.GameObjects.Text
  };

  private currentAvatar: string;

  private myPlayerID: string;

  private players: Player[] = [];

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys[] = [];

  /*
   * A "captured" key doesn't send events to the browser - they are trapped by Phaser
   * When pausing the game, we uncapture all keys, and when resuming, we re-capture them.
   * This is the list of keys that are currently captured by Phaser.
   */
  private previouslyCapturedKeys: number[] = [];

  private lastLocation?: UserLocation;

  private ready = false;

  private paused = false;

  private video: Video;

  private emitMovement: (loc: UserLocation) => void;

  constructor(video: Video, emitMovement: (loc: UserLocation) => void, myPlayerID : string, currentAvatar: string) {
    // Add current avatar in constructor parameters and assign to private variable
    super('PlayGame');
    this.video = video;
    this.emitMovement = emitMovement;
    this.myPlayerID = myPlayerID;
    this.currentAvatar = currentAvatar;
  }

  preload() {
    // this.load.image("logo", logoImg);
    // this.load.atlas('atlas3', '/assets/atlas/atlas3.png', '/assets/atlas/atlas3.json');
    this.load.image('tiles', '/assets/tilesets/tuxmon-sample-32px-extruded.png');
    this.load.tilemapTiledJSON('map', '/assets/tilemaps/tuxemon-town.json');
    this.load.atlas('misa', '/assets/atlas/atlas.png', '/assets/atlas/atlas.json');
    this.load.atlas('catgirl', '/assets/atlas/catgirl.png', '/assets/atlas/catgirl.json');
    this.load.atlas('aang', '/assets/atlas/aang.png', '/assets/atlas/aang.json');
    this.load.atlas('beachcomber', '/assets/atlas/beachcomber.png', '/assets/atlas/beachcomber.json');
    this.load.atlas('bob', '/assets/atlas/bob.png', '/assets/atlas/bob.json');
    this.load.atlas('bossman', '/assets/atlas/bossman.png', '/assets/atlas/bossman.json');
    this.load.atlas('brute', '/assets/atlas/brute.png', '/assets/atlas/brute.json');
    this.load.atlas('captain', '/assets/atlas/captain.png', '/assets/atlas/captain.json');
    this.load.atlas('childactor', '/assets/atlas/childactor.png', '/assets/atlas/childactor.json');
    this.load.atlas('dragonrider', '/assets/atlas/dragonrider.png', '/assets/atlas/dragonrider.json');
    this.load.atlas('fisher', '/assets/atlas/fisher.png', '/assets/atlas/fisher.json');
    this.load.atlas('hacker', '/assets/atlas/hacker.png', '/assets/atlas/hacker.json');
    this.load.atlas('landbird', '/assets/atlas/landbird.png', '/assets/atlas/landbird.json');
    this.load.atlas('ninja', '/assets/atlas/ninja.png', '/assets/atlas/ninja.json');
    this.load.atlas('robot', '/assets/atlas/robot.png', '/assets/atlas/robot.json');
    this.load.atlas('rookie', '/assets/atlas/rookie.png', '/assets/atlas/rookie.json');
    this.load.atlas('sami', '/assets/atlas/sami.png', '/assets/atlas/sami.json');
    this.load.atlas('scientist', '/assets/atlas/scientist.png', '/assets/atlas/scientist.json');
    this.load.atlas('spooky', '/assets/atlas/spooky.png', '/assets/atlas/spooky.json');
    this.load.atlas('spyderboss', '/assets/atlas/spyderboss.png', '/assets/atlas/spyderboss.json');
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
    const avatarName = this.currentAvatar;
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
    if (this.myPlayerID !== myPlayer.id && this.physics && player.location) {
      let { sprite } = myPlayer;
      // const avatar = myPlayer.currentAvatar;
      if (!sprite) {
        sprite = this.physics.add
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - JB todo
          .sprite(0, 0, `${avatarName}`, `${avatarName}-front`)
          .setSize(30, 40)
          .setOffset(0, 24);
        const label = this.add.text(0, 0, myPlayer.userName, {
          font: '18px monospace',
          color: '#000000',
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
        sprite.anims.play(`${avatarName}-${player.location.rotation}-walk`, true);
      } else {
        sprite.anims.stop();
        sprite.setTexture(`${avatarName}`, `${avatarName}-${player.location.rotation}`);
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
    if (this.paused) {
      return;
    }
    if (this.player && this.cursors) {
      const speed = 175;
      const prevVelocity = this.player.sprite.body.velocity.clone();
      const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;

      // Stop any previous movement from the last frame
      body.setVelocity(0);
      
      const avatarName = this.currentAvatar;
      const primaryDirection = this.getNewMovementDirection();
      switch (primaryDirection) {
        case 'left':
          body.setVelocityX(-speed);
          this.player.sprite.anims.play(`${avatarName}-left-walk`, true);
          break;
        case 'right':
          body.setVelocityX(speed);
          this.player.sprite.anims.play(`${avatarName}-right-walk`, true);
          break;
        case 'front':
          body.setVelocityY(speed);
          this.player.sprite.anims.play(`${avatarName}-front-walk`, true);
          break;
        case 'back':
          body.setVelocityY(-speed);
          this.player.sprite.anims.play(`${avatarName}-back-walk`, true);
          break;
        default:
          // Not moving
          this.player.sprite.anims.stop();
          // If we were moving, pick and idle frame to use
          if (prevVelocity.x < 0) {
            this.player.sprite.setTexture(`${avatarName}`, `${avatarName}-left`);
          } else if (prevVelocity.x > 0) {
            this.player.sprite.setTexture(`${avatarName}`, `${avatarName}-right`);
          } else if (prevVelocity.y < 0) {
            this.player.sprite.setTexture(`${avatarName}`, `${avatarName}-back`);
          } else if (prevVelocity.y > 0) this.player.sprite.setTexture(`${avatarName}`, `${avatarName}-front`);
          break;
      }

      // Normalize and scale the velocity so that player can't move faster along a diagonal
      this.player.sprite.body.velocity.normalize()
        .scale(speed);

      const isMoving = primaryDirection !== undefined;
      this.player.label.setX(body.x);
      this.player.label.setY(body.y - 20);
      if (!this.lastLocation
        || this.lastLocation.x !== body.x
        || this.lastLocation.y !== body.y
        || (isMoving && this.lastLocation.rotation !== primaryDirection)
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
    const map = this.make.tilemap({ key: 'map' });

    /* Parameters are the name you gave the tileset in Tiled and then the key of the
     tileset image in Phaser's cache (i.e. the name you used in preload)
     */
    const tileset = map.addTilesetImage('tuxmon-sample-32px-extruded', 'tiles');

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const belowLayer = map.createLayer('Below Player', tileset, 0, 0);
    const worldLayer = map.createLayer('World', tileset, 0, 0);
    worldLayer.setCollisionByProperty({ collides: true });
    const aboveLayer = map.createLayer('Above Player', tileset, 0, 0);
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


    // Find all of the transporters, add them to the physics engine
    const transporters = map.createFromObjects('Objects',
      { name: 'transporter' })
    this.physics.world.enable(transporters);

    // For each of the transporters (rectangle objects), we need to tweak their location on the scene
    // for reasons that are not obvious to me, but this seems to work. We also set them to be invisible
    // but for debugging, you can comment out that line.
    transporters.forEach(transporter => {
        const sprite = transporter as Phaser.GameObjects.Sprite;
        sprite.y += 2 * sprite.height; // Phaser and Tiled seem to disagree on which corner is y
        sprite.setVisible(false); // Comment this out to see the transporter rectangles drawn on
                                  // the map
      }
    );

    const labels = map.filterObjects('Objects',(obj)=>obj.name==='label');
    labels.forEach(label => {
      if(label.x && label.y){
        this.add.text(label.x, label.y, label.text.text, {
          color: '#FFFFFF',
          backgroundColor: '#000000',
        })
      }
    });



    const cursorKeys = this.input.keyboard.createCursorKeys();
    this.cursors.push(cursorKeys);
    this.cursors.push(this.input.keyboard.addKeys({
      'up': Phaser.Input.Keyboard.KeyCodes.W,
      'down': Phaser.Input.Keyboard.KeyCodes.S,
      'left': Phaser.Input.Keyboard.KeyCodes.A,
      'right': Phaser.Input.Keyboard.KeyCodes.D
    }, false) as Phaser.Types.Input.Keyboard.CursorKeys);
    this.cursors.push(this.input.keyboard.addKeys({
      'up': Phaser.Input.Keyboard.KeyCodes.H,
      'down': Phaser.Input.Keyboard.KeyCodes.J,
      'left': Phaser.Input.Keyboard.KeyCodes.K,
      'right': Phaser.Input.Keyboard.KeyCodes.L
    }, false) as Phaser.Types.Input.Keyboard.CursorKeys);




    // Create a sprite with physics enabled via the physics system. The image used for the sprite
    // has a bit of whitespace, so I'm using setSize & setOffset to control the size of the
    // player's body.
    const avatarName = this.currentAvatar;
    const sprite = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, `${avatarName}`, `${avatarName}-front`)
      .setSize(30, 40)
      .setOffset(0, 24);
    const label = this.add.text(spawnPoint.x, spawnPoint.y - 20, '(You)', {
      font: '18px monospace',
      color: '#000000',
      // padding: {x: 20, y: 10},
      backgroundColor: '#ffffff',
    });
    this.player = {
      sprite,
      label
    };

    /* Configure physics overlap behavior for when the player steps into
    a transporter area. If you enter a transporter and press 'space', you'll
    transport to the location on the map that is referenced by the 'target' property
    of the transporter.
     */
    this.physics.add.overlap(sprite, transporters,
      (overlappingObject, transporter)=>{
      if(cursorKeys.space.isDown && this.player){
        // In the tiled editor, set the 'target' to be an *object* pointer
        // Here, we'll see just the ID, then find the object by ID
        const transportTargetID = transporter.getData('target') as number;
        const target = map.findObject('Objects', obj => (obj as unknown as Phaser.Types.Tilemaps.TiledObject).id === transportTargetID);
        if(target && target.x && target.y && this.lastLocation){
          // Move the player to the target, update lastLocation and send it to other players
          this.player.sprite.x = target.x;
          this.player.sprite.y = target.y;
          this.lastLocation.x = target.x;
          this.lastLocation.y = target.y;
          this.emitMovement(this.lastLocation);
        }
        else{
          throw new Error(`Unable to find target object ${target}`);
        }
      }
    })

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
      key: `${avatarName}-left-walk`,
      frames: anims.generateFrameNames(`${avatarName}`, {
        prefix: `${avatarName}-left-walk.`,
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: `${avatarName}-right-walk`,
      frames: anims.generateFrameNames(`${avatarName}`, {
        prefix: `${avatarName}-right-walk.`,
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: `${avatarName}-front-walk`,
      frames: anims.generateFrameNames(`${avatarName}`, {
        prefix: `${avatarName}-front-walk.`,
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: `${avatarName}-back-walk`,
      frames: anims.generateFrameNames(`${avatarName}`, {
        prefix: `${avatarName}-back-walk.`,
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



    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, `Arrow keys to move, space to transport\nCurrent town: ${this.video.townFriendlyName} (${this.video.coveyTownID})`, {
        font: '18px monospace',
        color: '#000000',
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

  pause() {
    this.paused = true;
    this.previouslyCapturedKeys = this.input.keyboard.getCaptures();
    this.input.keyboard.clearCaptures();
  }

  resume() {
    this.paused = false;
    if(Video.instance()){
      // If the game is also in process of being torn down, the keyboard could be undefined
      this.input.keyboard.addCapture(this.previouslyCapturedKeys);
    }
    this.previouslyCapturedKeys = [];
  }
}

export default function WorldMap(): JSX.Element {
  const video = Video.instance();
  const {
    emitMovement, players, myPlayerID, apiClient
  } = useCoveyAppState();

  const { user, isAuthenticated } = useAuth0();
  const [gameScene, setGameScene] = useState<CoveyGameScene>();
  const toast = useToast();
  
  const [currentAvatar, setCurrentAvatar] = useState<string>('misa');
  
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

      

      if (isAuthenticated && user) {
        apiClient.getCurrentAvatar({email: user.email})
          .then((avatar) => {
            setCurrentAvatar(avatar);
          })
          .catch((err) => {
            toast({
              title: 'Get avatar failed',
              description: err.toString(),
              status: 'error'
            })
          })
      } else {
        setCurrentAvatar('misa');
      }

      const newGameScene = new CoveyGameScene(video, emitMovement, myPlayerID, currentAvatar);
      setGameScene(newGameScene);
      game.scene.add('coveyBoard', newGameScene, true);
      video.pauseGame = () => {
        newGameScene.pause();
      }
      video.unPauseGame = () => {
        newGameScene.resume();
      }
    }
    return () => {
      game.destroy(true);
    };
  }, [video, emitMovement, myPlayerID, user, isAuthenticated, currentAvatar, apiClient, toast]);

  const deepPlayers = JSON.stringify(players);
  useEffect(() => {
    gameScene?.updatePlayersLocations(players);
  }, [players, deepPlayers, gameScene]);

  return <div id="map-container"/>;
}
