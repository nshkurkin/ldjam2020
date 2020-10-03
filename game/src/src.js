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

    this.load.json('bob-desc', 'assets/bob.json');
    this.load.spritesheet('bob', 'assets/pc_skins.png', { frameWidth: 10, frameHeight: 15 });
    this.load.json('autumn-desc', 'assets/autumn.json');
    this.load.spritesheet('autumn', 'assets/pc_skins.png', { frameWidth: 10, frameHeight: 15 });
    this.load.json('rudy-desc', 'assets/rudy.json');
    this.load.spritesheet('rudy', 'assets/pc_skins.png', { frameWidth: 10, frameHeight: 15 });
    this.load.json('henry-desc', 'assets/henry.json');
    this.load.spritesheet('henry', 'assets/pc_skins.png', { frameWidth: 10, frameHeight: 15 });
}

function create ()
{
    g.worldClock = new Phaser.Time.Clock(this);
    g.fx.data.boomerang = Util.finishLoadAsset('boomerang-desc');

    g.fx.data.bob = Util.finishLoadAsset('bob-desc');
    g.fx.data.autumn = Util.finishLoadAsset('autumn-desc');
    g.fx.data.rudy = Util.finishLoadAsset('rudy-desc');
    g.fx.data.henry = Util.finishLoadAsset('henry-desc');

    g.fx.data.blacksquare = Util.finishLoadAsset('blacksquare-desc');
    g.fx.data.bluesquare = Util.finishLoadAsset('bluesquare-desc');
    g.fx.data.redsquare = Util.finishLoadAsset('redsquare-desc');
    g.fx.data.whitesquare = Util.finishLoadAsset('whitesquare-desc');

    g.named.boomie = new Boomerang(fxData=g.fx.data.boomerang, pos=MakeVec2(350, 400));
    g.named.boomie.positionProvider = Boomerang.lerpToMouseFunc();
    
    // @TEMP
    g.engine.physics.add.sprite(100, 100, g.fx.data.bob.id).setScale(g.scale).anims.play("bob:dir:dr", true);
    g.engine.physics.add.sprite(200, 100, g.fx.data.autumn.id).setScale(g.scale).anims.play("autumn:dir:dr", true);
    g.engine.physics.add.sprite(300, 100, g.fx.data.rudy.id).setScale(g.scale).anims.play("rudy:dir:dr", true);
    g.engine.physics.add.sprite(400, 100, g.fx.data.henry.id).setScale(g.scale).anims.play("henry:dir:dr", true);

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
    drawnPathPolygon.displayOriginX = 0.5;
    drawnPathPolygon.displayOriginY = 0.5;

    g.named.boomie.positionProvider = Boomerang.lerpAlongPerimeter(drawnPathPolygon, /* speed */ 20);
}
