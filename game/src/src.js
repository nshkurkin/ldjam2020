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
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

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
    g.named.background.setCollisionFromCollisionGroup(true);

    // @TEMP: Debug render collisions
    g.named.background_debug_gfx = this.add.graphics();
    drawCollisionShapes(g.named.background_debug_gfx, g.named.background, g.scale);

    g.named.player = new Player(g.fx.data.bob, MakeVec2(100, 100));
    g.named.player.altSkins = [g.fx.data.bob, g.fx.data.autumn, g.fx.data.rudy, g.fx.data.henry];
    g.engine.physics.add.collider(g.named.player.gameObj, g.named.background, null, null, g.engine);

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
}

function onMouseUp (pointer)
{

}

function onMouseMove (pointer)
{

}
