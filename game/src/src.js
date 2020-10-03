
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    pixelArt: true,
    antialias: false,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// chris was here - remove dis

var player;
var explosion;
var exampleBullet;
var cursors;
var spaceBar;
var gScale = 5;
var engine;

var entities = []

var fx = new Object();
fx.data = new Object();

var game = new Phaser.Game(config);

function preload ()
{
    engine = this

    // this.load.json('ship-desc', 'assets/ships.json');
    // this.load.spritesheet('ship', 'assets/ships.png', { frameWidth: 10, frameHeight: 10 });
}

function finishLoadAsset (phaser, json_name)
{
    var data = phaser.cache.json.get(json_name);

    if (data.type == "sprite-sheet")
    {
        for (var keyFrame of data.keyFrames) {
            if (keyFrame.len > 1) {
                phaser.anims.create({
                    key: keyFrame.key,
                    frames: phaser.anims.generateFrameNumbers(data.id, 
                            { start:  keyFrame.start, end: keyFrame.start + keyFrame.len - 1 }),
                    frameRate: keyFrame.rate,
                    repeat: keyFrame.repeat
                });
            }
            else {
                phaser.anims.create({
                    key: keyFrame.key,
                    frames: [ { key: data.id, frame: keyFrame.start } ],
                    frameRate: keyFrame.rate
                });
            }
        }
    }

    return data;
}

function create ()
{
    var shipData = finishLoadAsset(this, 'ship-desc');
    fx.data.explosion_red = finishLoadAsset(this, 'explosion-fx-red-desc');
    fx.data.bullet = finishLoadAsset(this, 'bullet-desc');

    // The player and its settings
    player = this.physics.add.sprite(350, 400, shipData.id).setScale(gScale);

    //  Player physics properties. Give the little guy a slight bounce.
    player.setCollideWorldBounds(true);

    explosion = this.physics.add.sprite(100, 100, fx.data.explosion_red.id).setScale(gScale);
    exampleBullet = this.physics.add.sprite(200, 100, fx.data.bullet.id).setScale(gScale);

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();
    spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function update ()
{
    for (var entity of entities) {
        entity.update();
    }
}
