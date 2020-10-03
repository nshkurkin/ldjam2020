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

var Vec2 = Phaser.Math.Vector2;

// chris was here - remove dis

var player;
var explosion;
var exampleBullet;
var cursors;
var spaceBar;
var gScale = 5;
var engine;

// UI for drawing the boomerang path
var drawnPathPolygon = null;
var drawnPathPoints = [];
var pathInProgress = false;


var entities = []

var fx = new Object();
fx.data = new Object();

var game = new Phaser.Game(config);

function preload ()
{
    engine = this

    this.load.json('boomerang-desc', 'assets/simple_boomerang.json');
    this.load.spritesheet('boomerang', 'assets/simple_boomerang.png', { frameWidth: 10, frameHeight: 10 });
}

function finishLoadAsset (phaser, json_name)
{
    var data = phaser.cache.json.get(json_name);

    if (data.type == 'sprite-sheet')
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
    fx.data.boomerang = finishLoadAsset(this, 'boomerang-desc');

    var boomerang = this.physics.add.sprite(350, 400, fx.data.boomerang.id).setScale(gScale);
    boomerang.anims.play('spin', true);

    drawnPathPolygon = this.add.polygon(100, 100, [new Vec2(0, 0)]);
    drawnPathPolygon.setStrokeStyle(6, 0xefc53f);
    drawnPathPolygon.closePath = false;

    this.input.on('pointermove', onMouseMove);
    this.input.on('pointerdown', onMouseDown);
    this.input.on('pointerup', onMouseUp);
}

function update ()
{
    for (var entity of entities) {
        entity.update();
    }
}

function onMouseDown (pointer)
{
    console.log("mouse down at " + pointer.x + " " + pointer.y);
    if (!pathInProgress)
    {
        pathInProgress = true;
        drawnPathPoints = [new Vec2(pointer.x, pointer.y)];
        drawnPathPolygon.setData(drawnPathPoints);
    }
    else
    {
        // TODO make this happen as you click and drag
        drawnPathPoints.push(new Vec2(pointer.x, pointer.y));
        drawnPathPolygon.setData(drawnPathPoints);
        console.log(drawnPathPoints);
    }
}

function onMouseUp (pointer)
{

}

function onMouseMove (pointer)
{

}
