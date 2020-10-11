
// TODO List:
//
//     o (iOS) Tilemap needs to be redone due to pixel bleeding
//

var g = new Object();
g.debug = false;
g.debugPretendToBeMobile = false;
g.debugShowFps = false;
g.scale = 4.0;
g.fx = new Object();
g.fx.data = new Object();
g.layers = new Object();
g.layers.effects = 6;
g.layers.player = 5;
g.layers.interactables = 4;
g.layers.boomieTrail = 3;
g.isMobile = false;
g.useJoystickPlugin = true;
g.disableWebAudio = false;

// Early check if we need to disable web audio.
// https://stackoverflow.com/a/11381730
window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };

// NOTE: This is needed for audio to work on iOS/Android
g.disableWebAudio = window.mobileCheck();

const FPS_LIMIT = 60;

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

var config = {
    type: Phaser.AUTO,
    backgroundColor: '#131314',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
    },
    pixelArt: true,
    antialias: false,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: g.debug,
            fps: FPS_LIMIT,
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    audio : {
        disableWebAudio: g.disableWebAudio,
    },
    fps: FPS_LIMIT,
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
    ["swap", "swap-desc", "swap.json", "swap.png", { frameWidth: 34, frameHeight: 20 }],
    ["hit_stuff", "hit_stuff-desc", "hit_stuff.json", "hit_stuff.png", { frameWidth: 34, frameHeight: 20 }],
    ["move_joystick", "move_joystick-desc", "move_joystick.json", "move_joystick.png", { frameWidth: 50, frameHeight: 50 }],
    ["swap_click", "swap_click-desc", "swap_click.json", "swap_click.png", { frameWidth: 25, frameHeight: 25 }],

    ["boomerang", "boomerang-desc", "simple_boomerang.json", "simple_boomerang.png", { frameWidth: 10, frameHeight: 10 }],
    ["fullscreen", "fullscreen-desc", "fullscreen.json", "fullscreen.png", { frameWidth: 15, frameHeight: 15 }],

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
    // NOTE: "mobile ok" only matters for if "g.disableWebAudio" is true.
    "music": ["assets/music/song", .3,                     /* mobile ok */ true ],

    "boomie_target": ["assets/sfx/boomie_target", .2,      /* mobile ok */ false ],
    "boomie_hit_wall": ["assets/sfx/boomie_hit_wall", .1,  /* mobile ok */ true  ],
    "boomie_throw": ["assets/sfx/boomie_throw", .5,        /* mobile ok */ false ],
    "boomie_retrieve": ["assets/sfx/boomie_retrieve", .5,  /* mobile ok */ false ],
    "boomie_loop": ["assets/sfx/boomie_loop", .3,          /* mobile ok */ false ],
    "set_fire": ["assets/sfx/set_fire", .1,                /* mobile ok */ true  ],
    "box_break": ["assets/sfx/box_break", .6,              /* mobile ok */ false ],
    "door_open": ["assets/sfx/door_open", .8,              /* mobile ok */ false ],
    "hit_switch": ["assets/sfx/hit_switch", .5,            /* mobile ok */ true  ],
    "switch_tick": ["assets/sfx/switch_tick", .2,          /* mobile ok */ true  ],
    // box_catch_fire is not in use rn
};
// dictionary of audio objects
g.sfx = {};

g.interactableClassList = new Object();

function preload ()
{
    g.engine = this
    this.physics.world.setFPS(FPS_LIMIT);

    // Loading bar.
    let loadBarWidth = DEFAULT_WIDTH / 4.0;
    let loadBarHeight = loadBarWidth / 8.0;
    let loadBarPad = loadBarHeight / 8.0;
    g.named.progressBar = this.add.graphics();
    g.named.progressBox = this.add.graphics();

    this.load.on('progress', function (value) {
        let camera = g.engine.cameras.main;
        g.named.progressBox.clear();
        g.named.progressBox.fillStyle(0x222222, 0.8);
        g.named.progressBox.fillRect(
                camera.centerX - 0.5 * loadBarWidth, 
                camera.centerY - 0.5 * loadBarHeight, 
                loadBarWidth, loadBarHeight);

        g.named.progressBar.clear();
        g.named.progressBar.fillStyle(0xffffff, 1);
        g.named.progressBar.fillRect(
                camera.centerX - 0.5 * loadBarWidth + loadBarPad, 
                camera.centerY - 0.5 * loadBarHeight + loadBarPad,
                (loadBarWidth - 2.0 * loadBarPad) * value, loadBarHeight - 2.0 * loadBarPad);
    });

    this.load.on('complete', function (value) {
        g.named.progressBar.destroy();
        g.named.progressBox.destroy();
    });

    if (this.sys.game.device.os.desktop) {
        console.log("desktop device")
        g.isMobile = false;
    }
    else {
        console.log("mobile device")
        g.isMobile = true;
    }

    if (g.debugPretendToBeMobile) {
        console.log("forced mobile device")
        g.isMobile = true;
    }

    for (var assetTuple of g.spritesheetAssetList) {
        this.load.json(assetTuple[1], 'assets/' + assetTuple[2]);
        this.load.spritesheet(assetTuple[0], 'assets/' + assetTuple[3], assetTuple[4]);
    }

    for (var sfxKey of Object.keys(g.sfxAssetData))
    {
        let baseFileName =  g.sfxAssetData[sfxKey][0];
        this.load.audio(sfxKey, [baseFileName + ".wav", baseFileName + ".ogg", baseFileName + ".mp3"], 
            // NOTE: On mobile (with HTML 5 audio) we need to specify how many simultaneous instances can play
            { instances: 5 });
    }

    // World tileset
    this.load.image("static_floors", "assets/map/static_floors.png");
    this.load.tilemapTiledJSON("world-tiles-desc", "assets/map/first_level.json");

    if (g.useJoystickPlugin) {
        this.load.plugin('rexvirtualjoystickplugin', 
                'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);
    }
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
        "swap" : StaticText,
        "hit_stuff": StaticText,
        "move_joystick": StaticText,
        "swap_click": StaticText,
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
    
    // group for Fire objects (tinder = burnable, fires = on fire)
    g.named.tinder = this.physics.add.group({ allowGravity: false });
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
        // Names of the form "r##" (level markers)
        if (name.length <= 3) {
            rect.username = name;
            g.named.roomTransitionArray.push(rect);
        }
        g.named.roomTransitionsByName[name] = rect;

        if (name == "player_spawn") {
            playerSpawnLoc = pos;
        }
    }
    g.named.roomTransitionArray.sort((a, b) => (a.username > b.username) ? 1 : -1);
    g.debugTransitionIdx = 0;
    if (g.debug) {
        var levelNames = [];
        for (var level of g.named.roomTransitionArray) {
            levelNames.push(level.username);
        }
        console.log("Available levels: ", levelNames, "(new index: ", g.debugTransitionIdx, ")");
    }

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
    g.engine.physics.add.overlap(g.named.fires, g.named.tinder, Fire.onCollideFires, null, g.engine);

    this.cameras.main.setBounds(0, 0, 5120, 5120);

    // Boomie HUD on mobile
    if (g.isMobile) {
        g.named.boomieThrowHud = g.engine.physics.add.sprite(0, 0, g.fx.data.boomerang.id).setScale(4.0 * g.scale);
        g.named.boomieThrowHud.alpha = 0.5
        g.named.boomieThrowHud.depth = 8;
        g.named.boomieThrowHud.setInteractive().on('pointerdown', function() {
            g.named.player.pendingBoomieThrow = true;
        });
    }

    playLoop("music");

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

    g.debugCycleLevelNext = new KeyState(g.engine.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FORWARD_SLASH));
    g.debugCycleLevelPrev = new KeyState(g.engine.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PERIOD));

    if (g.debugShowFps) {
        g.named.fps = this.add.text(10, 10, '', { font: '16px Courier', fill: '#00ff00' });
    }

    // Fullscreen button
    // @FIXME: Disable this for now as mobile can't use this anyways
    if (false && g.isMobile) {
        g.named.fullscreenBtn = this.physics.add.sprite(0, 0, g.fx.data.fullscreen.id).setScale(g.scale);
        g.named.fullscreenBtn.alpha = 0.25;
        g.named.fullscreenBtn.setInteractive().on('pointerdown', function() {
            if (!g.engine.scale.isFullscreen) {
                g.engine.scale.startFullscreen();
                g.named.fullscreenBtn.alpha = 0.01;
                g.game.canvas.parentElement.style.backgroundColor = "#131314";
            }
            else {
                g.engine.scale.stopFullscreen();
                g.named.fullscreenBtn.alpha = 0.25;
            }
        });
    }
}

function update (time, delta)
{
    g.worldClock.update(time, delta);
    if (g.debug) {
        var changed = false;
        if (g.debugCycleLevelNext.keystroke()) {
            g.debugTransitionIdx = (g.debugTransitionIdx + 1) % g.named.roomTransitionArray.length;
            changed = true;
        }
        if (g.debugCycleLevelPrev.keystroke()) {
            g.debugTransitionIdx = (g.named.roomTransitionArray.length + g.debugTransitionIdx - 1) % g.named.roomTransitionArray.length;
            changed = true;
        }

        if (changed) {
            let transition = g.named.roomTransitionArray[g.debugTransitionIdx];
            g.named.player.gameObj.x = transition.x;
            g.named.player.gameObj.y = transition.y;
            console.log("Switching to level: ", transition.username);
        }
    }

    if (g.debugShowFps) {
        let worldView = g.engine.cameras.main.worldView;
        g.named.fps.x = worldView.centerX;
        g.named.fps.y = worldView.centerY;
        g.named.fps.setText([
            'FPS:',
            g.game.loop.actualFps,
        ]);
    }

    if (g.named.fullscreenBtn) {
        let worldView = g.engine.cameras.main.worldView;
        g.named.fullscreenBtn.x = worldView.centerX - worldView.width/2.0 
                + 0.5 * g.named.fullscreenBtn.displayWidth;
        g.named.fullscreenBtn.y = worldView.centerY - worldView.height/2.0 
                + 0.5 * g.named.fullscreenBtn.displayHeight;
    }

    g.named.player.update(time, delta);

    if (g.named.boomieThrowHud) {
        let worldView = g.engine.cameras.main.worldView;
        // NOTE: The positioning is such that boomie generally does not cover any part of any puzzle.
        g.named.boomieThrowHud.x = worldView.centerX + worldView.width/2.0 
                - g.named.boomieThrowHud.displayWidth * 0.60;
        g.named.boomieThrowHud.y = worldView.centerY + worldView.height/2.0 
                - g.named.boomieThrowHud.displayHeight * 1.25;
    }

    for (var entity of g.entities) {
        entity.update(time, delta);
    }
}

g.mouseDown = false;
g.lastDownDelta = null;
g.deltaLastMouseDown = null;
function onMouseDown (pointer)
{
    console.log("mouse down at " + pointer.x + " " + pointer.y);
    
    g.lastPointer = MakeVec2(pointer.x, pointer.y);
    g.mouseDownStart = g.lastPointer;
    g.mouseDown = true;

    if (g.useJoystickPlugin) {
        g.named.player.joystick.base.alpha = 0.1;
        g.named.player.joystick.thumb.alpha = 0.1;

        g.named.player.joystick.x = pointer.x;
        g.named.player.joystick.y = pointer.y;
    }

    // NOTE: On mobile we need to handle resuming "suspended" audio
    if (g.game.sound.context.state === 'suspended') {
        g.game.sound.context.resume();
    }
}

function onMouseUp (pointer)
{
    g.lastPointer = null;
    g.mouseDown = false;
    g.mouseDownStart = null;

    if (!g.useJoystickPlugin) {
        g.named.player.joystick.left  = false;
        g.named.player.joystick.right = false;
        g.named.player.joystick.up    = false;
        g.named.player.joystick.down  = false;
    }
    else {
        g.named.player.joystick.base.alpha = 0.0;
        g.named.player.joystick.thumb.alpha = 0.0;
    }
}

function onMouseMove (pointer)
{
    if (g.mouseDown && !g.useJoystickPlugin) {
        if (!g.lastPointer) {
            g.lastPointer = MakeVec2(pointer.x, pointer.y);
        }
        if (!g.lastDownDelta) {
            g.lastDownDelta = MakeVec2(0, 0);
        }

        let delta = MakeVec2(pointer.x, pointer.y).subtract(g.mouseDownStart);
        let deltaDelta = delta.clone().subtract(g.lastDownDelta);
        if (!(delta.x == 0 && delta.y == 0) && deltaDelta.length() > 10.0) {
            g.named.player.joystick.left  = delta.x < 0;
            g.named.player.joystick.right = delta.x > 0;
            g.named.player.joystick.up    = delta.y < 0;
            g.named.player.joystick.down  = delta.y > 0;

            g.mouseDownStart = MakeVec2(pointer.x, pointer.y);
            g.lastDownDelta = delta;
        }

        g.lastPointer = MakeVec2(pointer.x, pointer.y);
    }
}

function playSFX(sfxKey)
{
    // NOTE: Playing sounds on mobile is expensive.
    if (!g.disableWebAudio || (!g.isMobile || (g.isMobile && g.sfxAssetData[sfxKey][2]))) {
        g.sfx[sfxKey].play({ loop: false });
    }
}

function playLoop(sfxKey)
{
    g.sfx[sfxKey].play({ loop: true });
}
function stopLoop(sfxKey)
{
    g.sfx[sfxKey].stop();
}
