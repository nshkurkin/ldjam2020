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

// UI for drawing the boomerang path
var drawnPathPolygon = null;
var drawnPathPoints = [];
var pathInProgress = false;

var g = new Object();
g.scale = 5.0;
// g.engine = ...;
g.entities = [];
// g.named.ui = null;
g.fx = new Object();
g.fx.data = new Object();
g.game = new Phaser.Game(config);
// g.worldClock = ...;

g.named = new Object();

function preload ()
{
    g.engine = this

    // temp colored squares to be stand-ins for other stuff
    this.load.json('blacksquare-desc', 'assets/blacksquare.json');
    this.load.spritesheet('blacksquare', 'assets/blacksquare.png', { frameWidth: 16, frameHeight: 16 });
    this.load.json('bluesquare-desc', 'assets/bluesquare.json');
    this.load.spritesheet('bluesquare', 'assets/bluesquare.png', { frameWidth: 16, frameHeight: 16 });
    this.load.json('redsquare-desc', 'assets/redsquare.json');
    this.load.spritesheet('redsquare', 'assets/redsquare.png', { frameWidth: 16, frameHeight: 16 });
    this.load.json('whitesquare-desc', 'assets/whitesquare.json');
    this.load.spritesheet('whitesquare', 'assets/whitesquare.png', { frameWidth: 16, frameHeight: 16 });


    this.load.json('boomerang-desc', 'assets/simple_boomerang.json');
    this.load.spritesheet('boomerang', 'assets/simple_boomerang.png', { frameWidth: 10, frameHeight: 10 });
}

function create ()
{
    g.worldClock = new Phaser.Time.Clock(this);
    g.fx.data.boomerang = Util.finishLoadAsset('boomerang-desc');
    g.fx.data.blacksquare = Util.finishLoadAsset('blacksquare-desc');
    g.fx.data.bluesquare = Util.finishLoadAsset('bluesquare-desc');
    g.fx.data.redsquare = Util.finishLoadAsset('redsquare-desc');
    g.fx.data.whitesquare = Util.finishLoadAsset('whitesquare-desc');

    g.named.player = new Player(fxData=g.fx.data.bluesquare, pos=MakeVec2(100, 100));

    g.named.boomie = new Boomerang(fxData=g.fx.data.boomerang, pos=MakeVec2(350, 400));
    g.named.boomie.positionProvider = Boomerang.lerpToMouseFunc();
    

    this.input.on('pointermove', onMouseMove);
    this.input.on('pointerdown', onMouseDown);
    this.input.on('pointerup', onMouseUp);
}

function update (time, delta)
{
    g.worldClock.update(time, delta);

    for (var entity of g.entities) {
        entity.update(time, delta);
    }
}

function onMouseDown (pointer)
{
    console.log("mouse down at " + pointer.x + " " + pointer.y);
    if (!pathInProgress)
    {
        pathInProgress = true;
        drawnPathPoints = [MakeVec2(pointer.x, pointer.y)];
        refreshDrawnPolygon();
    }
    else
    {
        // TODO make this happen as you click and drag
        drawnPathPoints.push(MakeVec2(pointer.x, pointer.y));
        refreshDrawnPolygon();
        console.log(drawnPathPoints);
    }
}

function onMouseUp (pointer)
{

}

function onMouseMove (pointer)
{

}

function refreshDrawnPolygon ()
{
    // delete and re add polygon. i cry every time
    if (null != drawnPathPolygon) {
        drawnPathPolygon.destroy();
    }
    drawnPathPolygon = g.engine.add.polygon(0, 0, drawnPathPoints);
    drawnPathPolygon.setStrokeStyle(6, 0xefc53f);
    drawnPathPolygon.setClosePath(false);
    drawnPathPolygon.displayOriginX = 0.5;
    drawnPathPolygon.displayOriginY = 0.5;

    g.named.boomie.positionProvider = Boomerang.lerpAlongPerimeter(drawnPathPolygon, /* speed */ 20);
}
