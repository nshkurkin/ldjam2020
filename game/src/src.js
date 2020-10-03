var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
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
g.scale = 4.0;
// g.engine = ...;
g.entities = [];
// g.named.ui = null;
g.fx = new Object();
g.fx.data = new Object();
g.game = new Phaser.Game(config);
// g.worldClock = ...;

g.named = new Object();

g.spritesheetAssetList = [
    // Temp colored squares to be stand-ins for other stuff
    ["blacksquare",     "blacksquare-desc", "blacksquare.json", "blacksquare.png", { frameWidth: 16, frameHeight: 16 }],
    ["bluesquare",      "bluesquare-desc",  "bluesquare.json",  "bluesquare.png",  { frameWidth: 16, frameHeight: 16 }],
    ["redsquare",       "redsquare-desc",   "redsquare.json",   "redsquare.png",   { frameWidth: 16, frameHeight: 16 }],
    ["whitesquare",     "whitesquare-desc", "whitesquare.json", "whitesquare.png", { frameWidth: 16, frameHeight: 16 }],

    ["boomerang", "boomerang-desc", "simple_boomerang.json", "simple_boomerang.png", { frameWidth: 10, frameHeight: 10 }],

    ["bob",    "bob-desc",    "bob.json",    "pc_skins.png", { frameWidth: 10, frameHeight: 15 }],
    ["autumn", "autumn-desc", "autumn.json", "pc_skins.png", { frameWidth: 10, frameHeight: 15 }],
    ["rudy",   "rudy-desc",   "rudy.json",   "pc_skins.png", { frameWidth: 10, frameHeight: 15 }],
    ["henry",  "henry-desc",  "henry.json",  "pc_skins.png", { frameWidth: 10, frameHeight: 15 }]
]

function preload ()
{
    g.engine = this

    for (var assetTuple of g.spritesheetAssetList) {
        this.load.json(assetTuple[1], 'assets/' + assetTuple[2]);
        this.load.spritesheet(assetTuple[0], 'assets/' + assetTuple[3], assetTuple[4]);
    }

    // World tileset
    this.load.image("static_floors", "assets/static_floors.png");
    this.load.tilemapTiledJSON("world-tiles-desc", "assets/first_level.json");
}

function create ()
{
    g.worldClock = new Phaser.Time.Clock(this);
    for (var assetTuple of g.spritesheetAssetList) {
        g.fx.data[assetTuple[0]] = Util.finishLoadAsset(assetTuple[1]);
    }

    // Finish loading the world tileset.
    g.named.world = this.add.tilemap('world-tiles-desc');
    var worldTileset = g.named.world.addTilesetImage("static_floors", "static_floors");
    g.named.background = g.named.world.createStaticLayer("ground-layer", worldTileset, 0, 0).setScale(g.scale);

    g.named.player = new Player(g.fx.data.bob, MakeVec2(100, 100));
    g.named.player.altSkins = [g.fx.data.bob, g.fx.data.autumn, g.fx.data.rudy, g.fx.data.henry];

    g.named.boomie = new Boomerang(g.fx.data.boomerang, MakeVec2(350, 400));
    g.named.boomie.positionProvider = Boomerang.lerpToMouseFunc();
    
    // @TEMP
    //g.engine.physics.add.sprite(100, 100, g.fx.data.bob.id).setScale(g.scale).anims.play("bob:dir:dr", true);
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

    g.named.player.update(time, delta);

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
