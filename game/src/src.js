
var g = new Object();
g.debug = true; //true;
g.scale = 4.0;
g.fx = new Object();
g.fx.data = new Object();
g.layers = new Object();
g.layers.effects = 6;
g.layers.player = 5;
g.layers.interactables = 4;
g.layers.boomieTrail = 3;

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
            debug: g.debug
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

g.game = new Phaser.Game(config);
// g.worldClock = ...;
// g.engine = ...;
g.named = new Object();
// g.named.ui = null;
g.entities = [];
g.byName = new Object();

g.spritesheetAssetList = [
    // Temp colored squares to be stand-ins for other stuff
    ["blacksquare",     "blacksquare-desc", "blacksquare.json", "blacksquare.png", { frameWidth: 16, frameHeight: 16 }],
    ["bluesquare",      "bluesquare-desc",  "bluesquare.json",  "bluesquare.png",  { frameWidth: 16, frameHeight: 16 }],
    ["redsquare",       "redsquare-desc",   "redsquare.json",   "redsquare.png",   { frameWidth: 16, frameHeight: 16 }],
    ["whitesquare",     "whitesquare-desc", "whitesquare.json", "whitesquare.png", { frameWidth: 16, frameHeight: 16 }],

    ["fire", "fire-desc", "fire.json", "fire.png", { frameWidth: 10, frameHeight: 10 }],
    ["torch", "torch-desc", "torch.json", "torch.png", { frameWidth: 10, frameHeight: 10 }],
    ["box", "box-desc", "box.json", "box.png", { frameWidth: 10, frameHeight: 10 }],

    ["arrows", "arrows-desc", "arrows.json", "arrows.png", { frameWidth: 10, frameHeight: 10 }],
    ["make_loops", "make_loops-desc", "make_loops.json", "make_loops.png", { frameWidth: 35, frameHeight: 40 }],
    ["move", "move-desc", "move.json", "move.png", { frameWidth: 30, frameHeight: 30 }],
    ["space", "space-desc", "space.json", "space.png", { frameWidth: 45, frameHeight: 30 }],

    ["boomerang", "boomerang-desc", "simple_boomerang.json", "simple_boomerang.png", { frameWidth: 10, frameHeight: 10 }],

    ["bob",    "bob-desc",    "bob.json",    "pc_skins.png", { frameWidth: 10, frameHeight: 15 }],
    ["autumn", "autumn-desc", "autumn.json", "pc_skins.png", { frameWidth: 10, frameHeight: 15 }],
    ["rudy",   "rudy-desc",   "rudy.json",   "pc_skins.png", { frameWidth: 10, frameHeight: 15 }],
    ["henry",  "henry-desc",  "henry.json",  "pc_skins.png", { frameWidth: 10, frameHeight: 15 }],

    ["basic_switch", "basic-switch-desc", "basic_switch.json", "basic_switch.png", { frameWidth: 10, frameHeight: 10 }],
    ["door", "door-desc", "door.json", "door.png", { frameWidth: 10, frameHeight: 30 }],
    ["door2", "door2-desc", "door2.json", "door2.png", { frameWidth: 30, frameHeight: 10 }],
];

// key: file path, volume, loop
// assume they all have .wav and .ogg
g.sfxAssetData = {
    "boomie_target": ["assets/sfx/boomie_target", .2 ],
    "boomie_hit_wall": ["assets/sfx/boomie_hit_wall", 1 ],
    "boomie_throw": ["assets/sfx/boomie_throw", .5 ],
    "boomie_retrieve": ["assets/sfx/boomie_retrieve", .5 ], // make this one box destroy?
    "boomie_loop": ["assets/sfx/boomie_loop", .3 ],
    "set_fire": ["assets/sfx/set_fire", .6 ],
    "box_break": ["assets/sfx/box_break", .6 ],
    "door_open": ["assets/sfx/door_open", .8 ],
    "hit_switch": ["assets/sfx/hit_switch", .5 ],
    // box_catch_fire is not in use rn
};
// dictionary of audio objects
g.sfx = {};

g.interactableClassList = new Object();

function preload ()
{
    g.engine = this

    for (var assetTuple of g.spritesheetAssetList) {
        this.load.json(assetTuple[1], 'assets/' + assetTuple[2]);
        this.load.spritesheet(assetTuple[0], 'assets/' + assetTuple[3], assetTuple[4]);
    }

    for (var sfxKey of Object.keys(g.sfxAssetData))
    {
        let baseFileName =  g.sfxAssetData[sfxKey][0];
        this.load.audio(sfxKey, [baseFileName + ".wav", baseFileName + ".ogg"]);
    }

    // World tileset
    this.load.image("static_floors", "assets/map/static_floors.png");
    this.load.tilemapTiledJSON("world-tiles-desc", "assets/map/first_level.json");
}

function create ()
{
    g.interactableClassList = {
        "basic_switch" : BasicSwitch,
        "door" : Door,
        "door2" : Door,
        "torch" : Torch,
        "box" : FlammableBox,

        "make_loops" : StaticText,
        "move" : StaticText,
        "space" : StaticText,
    };

    g.worldClock = new Phaser.Time.Clock(this);
    for (var assetTuple of g.spritesheetAssetList) {
        g.fx.data[assetTuple[0]] = Util.finishLoadAsset(assetTuple[1]);
    }

    for (var sfxKey of Object.keys(g.sfxAssetData))
    {
        let sfxTuple = g.sfxAssetData[sfxKey];
        let effect = this.sound.add(sfxKey, { volume: sfxTuple[1] });
        g.sfx[sfxKey] = effect;
    }
    
    // group for Fire objects
    g.named.fires = this.physics.add.group({ allowGravity: false });

    // Finish loading the world tileset.
    g.named.world = this.add.tilemap('world-tiles-desc');
    var worldTileset = g.named.world.addTilesetImage("static_floors", "static_floors");
    var arrowTileset = g.named.world.addTilesetImage("arrows", "arrows");
    g.named.background = g.named.world.createStaticLayer("ground-layer", worldTileset, 0, 0).setScale(g.scale);
    g.named.background.setCollisionFromCollisionGroup(true);
    g.named.backgroundEx = g.named.world.createStaticLayer("fluff-layer", arrowTileset, 0, 0).setScale(g.scale);
    
    // Generate everything-colliders from the map
    g.named.wallBlockers = this.physics.add.group({ allowGravity: false, immovable: true });
    g.named.background.forEachTile(function (tile)
    {
        var tileWorldX = tile.getLeft();
        var tileWorldY = tile.getTop();
        var collisionGroup = tile.getCollisionGroup();

        // console.log(collisionGroup);

        if (!collisionGroup || collisionGroup.objects.length === 0) { return; }

        // The group will have an array of objects - these are the individual collision shapes
        var objects = collisionGroup.objects;

        for (var i = 0; i < objects.length; i++)
        {
            var object = objects[i];
            var objectX = tileWorldX + object.x;
            var objectY = tileWorldY + object.y;

            // When objects are parsed by Phaser, they will be guaranteed to have one of the
            // following properties if they are a rectangle/ellipse/polygon/polyline.
            if (object.rectangle)
            {
                var pos = MakeVec2(objectX, objectY);
                var rect = new Phaser.GameObjects.Rectangle(g.engine, 0, 0, object.width, object.height).setScale(g.scale);
                rect.setPosition(pos.x + g.scale * rect.width/2.0, pos.y + g.scale * rect.height/2.0);
                g.named.wallBlockers.add(rect);
            }
        }
    });

    // Generate player-only colliders from the map
    g.named.playeronlyBlockers = this.physics.add.group({ allowGravity: false, immovable: true });
    var blockers = g.named.world.getObjectLayer('playeronly-collision-layer')['objects'];
    for (var blocker of blockers) {
        var pos = MakeVec2(blocker.x * g.scale, blocker.y * g.scale);
        var rect = new Phaser.GameObjects.Rectangle(this, 0, 0, blocker.width, blocker.height).setScale(g.scale);
        rect.setPosition(pos.x + g.scale * rect.width/2.0, pos.y + g.scale * rect.height/2.0);
        g.named.playeronlyBlockers.add(rect);
    }

    // Generate player-only colliders from the map
    var playerSpawnLoc = MakeVec2(100, 350);
    g.named.roomTransitions = this.physics.add.group({ allowGravity: false, immovable: true });
    g.named.roomTransitionsByName = {}
    g.named.roomTransitionArray = []
    var transitions = g.named.world.getObjectLayer('transition-marker-layer')['objects'];
    for (var transition of transitions) {
        //console.log("TRANSITION");
        //console.log(transition);
        var pos = MakeVec2(transition.x * g.scale, transition.y * g.scale);
        var rect = new Phaser.GameObjects.Rectangle(this, 0, 0, transition.width, transition.height).setScale(g.scale);
        rect.setPosition(pos.x + g.scale * rect.width/2.0, pos.y + g.scale * rect.height/2.0);
        let name = transition.name;
        rect.setData("name", name);
        let destination = Util.getTiledProperty(transition, "destination");
        rect.setData("destination", destination);
        rect.setData("direction", Util.getTiledProperty(transition, "direction"));
        //console.log("Destination of " + name + " is " + destination);
        g.named.roomTransitions.add(rect);
        g.named.roomTransitionArray.push(rect);
        g.named.roomTransitionsByName[name] = rect;

        if (name == "player_spawn") {
            playerSpawnLoc = pos;
        }
    }
    g.debugTransitionIdx = 0;

    // @TEMP: Debug render collisions
    //g.named.background_debug_gfx = this.add.graphics();
    //if (g.debug) {
    //    drawCollisionShapes(g.named.background_debug_gfx, g.named.background, g.scale);
    //}

    // Generate interactable colliders from the map
    g.named.interactables = this.physics.add.group({ allowGravity: false, immovable: true });
    var interactables = g.named.world.getObjectLayer('interactable-layer')['objects'];
    for (var desc of interactables) {
        let gid = desc.gid;
        // Search for the owning tileset.
        var tsetIdx = 0;
        for (var tset of g.named.world.tilesets) {
            if (gid >= tset.firstgid && gid < tset.firstgid + tset.total) {
                break;
            }
            tsetIdx += 1;
        }
        let theSet = g.named.world.tilesets[tsetIdx];
        let sheetName = theSet.name;
        let frameIdx = (gid - theSet.firstgid);

        // Extract out the custom data.
        var custData = new Object();
        if (desc.properties)
        {    
            for (var entry of desc.properties) {
                custData[entry.name] = entry.value;
            }
        }
        if (theSet.tileProperties && theSet.tileProperties[frameIdx]) {
            for (var key in theSet.tileProperties[frameIdx]) {
                custData[key] = theSet.tileProperties[frameIdx][key];
            }
        }

        let spawnPos = MakeVec2(desc.x * g.scale, desc.y * g.scale)
        var interactable = new g.interactableClassList[sheetName](g.fx.data[sheetName], spawnPos, custData);
        if (desc.rotation) {
            interactable.gameObj.setRotation(Util.degToRad(Math.round(desc.rotation)));
        }
        g.named.interactables.add(interactable.gameObj);
        if (custData.playerBlocker) {
            g.named.playeronlyBlockers.add(interactable.gameObj);
        }

        // Put our object into a global name list for later lookup.
        if (desc.name != "") {
            g.byName[desc.name] = interactable;
        }
    }

    g.named.player = new Player(g.fx.data.bob, playerSpawnLoc);
    g.named.player.altSkins = [g.fx.data.bob, g.fx.data.autumn, g.fx.data.rudy, g.fx.data.henry];
    g.named.player.swapSkin(Math.floor(Math.min(Math.random(), 0.999) * g.named.player.altSkins.length));
    g.engine.physics.add.collider(g.named.player.gameObj, g.named.background, null, null, g.engine);
    g.engine.physics.add.collider(g.named.player.gameObj, g.named.playeronlyBlockers, null, null, g.engine);
    g.engine.physics.add.collider(g.named.player.gameObj, g.named.wallBlockers, null, null, g.engine);
    g.engine.physics.add.overlap(g.named.player.gameObj, g.named.roomTransitions, g.named.player.onCollideRoomTransition, null, g.named.player);
    g.engine.physics.add.overlap(g.named.fires, g.named.fires, Fire.onCollideFires, null, g.engine);
    
    this.cameras.main.setBounds(0, 0, 5120, 5120);

    //g.named.boomie = new Boomerang(g.fx.data.boomerang, MakeVec2(350, 400));
    //g.named.boomie.positionProvider = Boomerang.lerpToMouseFunc();
    
    // @TEMP
    //g.engine.physics.add.sprite(100, 200, g.fx.data.autumn.id).setScale(g.scale).anims.play("autumn:dir:dr", true);
    //g.engine.physics.add.sprite(200, 200, g.fx.data.rudy.id).setScale(g.scale).anims.play("rudy:dir:dr", true);
    //g.engine.physics.add.sprite(300, 200, g.fx.data.henry.id).setScale(g.scale).anims.play("henry:dir:dr", true);
    //g.engine.physics.add.sprite(300, 200, g.fx.data.fire.id).setScale(g.scale).anims.play("fire:flicker", true);

    this.input.on('pointermove', onMouseMove);
    this.input.on('pointerdown', onMouseDown);
    this.input.on('pointerup', onMouseUp);

    g.debugCycleLevelNext = new KeyState(g.engine.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M));
    g.debugCycleLevelPrev = new KeyState(g.engine.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N));
}

function update (time, delta)
{
    g.worldClock.update(time, delta);
    if (g.debug) {
        if (g.debugCycleLevelNext.keystroke()) {
            g.debugTransitionIdx = (g.debugTransitionIdx + 1) % g.named.roomTransitionArray.length;
            g.named.player.onCollideRoomTransition(g.named.player, g.named.roomTransitionArray[g.debugTransitionIdx]);
        }
        if (g.debugCycleLevelPrev.keystroke()) {
            g.debugTransitionIdx = (g.named.roomTransitionArray.length + g.debugTransitionIdx - 1) % g.named.roomTransitionArray.length;
            g.named.player.onCollideRoomTransition(g.named.player, g.named.roomTransitionArray[g.debugTransitionIdx]);
        }
    }

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

function playSFX(sfxKey)
{
    g.sfx[sfxKey].play({ loop: false });
}

function playLoop(sfxKey)
{
    g.sfx[sfxKey].play({ loop: true });
}
function stopLoop(sfxKey)
{
    g.sfx[sfxKey].stop();
}