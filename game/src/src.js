
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

function create ()
{
    g.fx.data.boomerang = Util.finishLoadAsset('boomerang-desc');

    var boomie = new Boomerang(fxData=g.fx.data.boomerang, pos=MakeVec2(350, 400));
    boomie.positionProvider = function() { return g.game.input.mousePointer; };
}

function update ()
{
    for (var entity of g.entities) {
        entity.update();
    }
}
