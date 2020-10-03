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

// UI for drawing the boomerang path
var drawnPathPolygon = null;
var drawnPathPoints = [];
var pathInProgress = false;

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
    
    

    this.input.on('pointermove', onMouseMove);
    this.input.on('pointerdown', onMouseDown);
    this.input.on('pointerup', onMouseUp);
}

function update ()
{
    for (var entity of g.entities) {
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
        refreshDrawnPolygon();
    }
    else
    {
        // TODO make this happen as you click and drag
        drawnPathPoints.push(new Vec2(pointer.x, pointer.y));
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
}
