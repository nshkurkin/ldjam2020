
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

var g = new Object();
g.scale = 5.0;
// g.engine = ...;
g.entities = [];
g.fx = new Object();
g.fx.data = new Object();

g.game = new Phaser.Game(config);

function preload ()
{
    g.engine = this

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
    g.fx.data.boomerang = finishLoadAsset(this, 'boomerang-desc');

    new Boomerang(fxData=g.fx.data.boomerang, pos=MakeVec2(350, 400));
}

function update ()
{
    for (var entity of g.entities) {
        entity.update();
    }
}
