
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
var gScale = 5;

var entities = []

var fx = new Object();
fx.data = new Object();

var game = new Phaser.Game(config);

function preload ()
{
    this.load.json('ship-desc', 'assets/ships.json');
    this.load.spritesheet('ship', 'assets/ships.png', { frameWidth: 10, frameHeight: 10 });

    this.load.json('explosion-fx-red-desc', 'assets/explosion_red.json');
    this.load.spritesheet('explosion-fx-red', 'assets/explosion_red.png', { frameWidth: 10, frameHeight: 10 });

    this.load.json('bullet-desc', 'assets/bullet.json');
    this.load.spritesheet('bullet', 'assets/bullet.png', { frameWidth: 10, frameHeight: 10 });
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
}

function update ()
{
    explosion.anims.play('explosion_repeating', true);
    exampleBullet.anims.play('spiral', true);

    var velocity = 160;
    var direction = new Phaser.Math.Vector2(0, 0);

    if (cursors.left.isDown)
    {
        direction.x = -1;
    }
    else if (cursors.right.isDown)
    {
        direction.x = 1;
    }

    if (cursors.down.isDown)
    {
        direction.y = -1;
    }
    else if (cursors.up.isDown)
    {
        direction.y = 1;
    }

    player.setVelocity(direction.x * velocity, -direction.y * velocity);

    var dirMap = [
        /* -X */ [
            /* -Y */ "dir:dl",
            /* 0Y */ "dir:l",
            /* +Y */ "dir:ul",
        ],

        /* 0 X */ [
            /* -Y */ "dir:d",
            /* 0Y */ "none",
            /* +Y */ "dir:u",
        ],

        /* +X */ [
            /* -Y */ "dir:dr",
            /* 0Y */ "dir:r",
            /* +Y */ "dir:ur",
        ]
    ]

    var animToPlay = dirMap[direction.x + 1][direction.y + 1]

    if (animToPlay != "none") 
    {
        player.anims.play(animToPlay, true);
    }
}
