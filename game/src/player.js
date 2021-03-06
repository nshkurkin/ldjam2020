
// Expected Globals:
// g.engine : PhaserEngine
// g.scale : float
// g.entities : list<EntityObject>
// g.fx.data.player : FxObject

class Player 
{
    constructor (
        /* FxObject */ fxData = null, 
        /* Phaser.Math.Vector2 */ pos = null)
    {
        if (pos == null) {
            pos = MakeVec2(0, 0);
        }
        if (fxData == null) {
            fxData = g.fx.data.bob;
        }
        
        this.fxData = fxData;
        this.gameObj = g.engine.physics.add.sprite(pos.x, pos.y, fxData.id).setScale(g.scale);
        this.gameObj.body.offset.y = this.gameObj.body.height / 2.0;
        this.gameObj.body.setSize(
                /* size */ this.gameObj.body.width, this.gameObj.body.height / 2.0, 
                /* centered? */ false);
        this.gameObj.depth = g.layers.player;
        var thisRef = this;
        this.gameObj.setInteractive().on('pointerdown', function() {
            thisRef.swapSkin((thisRef.altSkinIdx + 1) % thisRef.altSkins.length);
        });

        this.velocity = 200;
        this.faceDirection = MakeVec2(1, 0);
        this.faceDirectionAnim = 'dir:dr';
        this.lastPlayedAnim = null;
        this.lastBoomieHelpAnim = null;
        this.altSkins = [fxData];
        this.altSkinIdx = 0;

        this.activeDrawPathBoomerang = null;
        this.activeBoomie = null; // TODO more than one boomie
        // move into boomerang?
        this.activeBoomiePolygon = null;

        this.leftKey = g.engine.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.rightKey = g.engine.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.upKey = g.engine.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.downKey = g.engine.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.boomerangKey = new KeyState(g.engine.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE));
        this.swapSkinKey = new KeyState(g.engine.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K));
        this.noClipKey = g.engine.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        
        this.pendingBoomieThrow = false;
        if (!g.useJoystickPlugin) {
            this.joystick = {
                left: false,
                right: false,
                up: false,
                down: false,
                base: {},
                thumb: {},
            };
        }
        else {
            var radius = 75;
            if (g.isMobile) {
                radius = 125;
            }
            this.joystick = g.engine.plugins.get('rexvirtualjoystickplugin').add(g.engine, {
                x: 0,
                y: 0,
                radius: radius,
                
                dir: '8dir',
                fixed: true,
                enable: true
            });
            this.joystick.base.alpha = 0.0;
            this.joystick.thumb.alpha = 0.0;
        }

        this.cachedScreenStartX = null;
        this.cachedscreenStartY = null;
    }

    playAnim(keyframeId)
    {
        if (keyframeId != this.lastPlayedAnim || 
                // The run animation may have stopped playing
                keyframeId.includes("run:")) {
            this.gameObj.anims.play(this.fxData.id + ':' + keyframeId, true);
            this.lastPlayedAnim = keyframeId;
        }
    }

    detachBoomie(animate=true)
    {
        if (null != this.activeBoomie)
        {
            this.activeBoomie.destroy(/* animate? */ animate);
            this.activeBoomie = null;
            this.activeBoomiePolygon.destroy();
            this.activeBoomiePolygon = null;
        }
    }

    // this runs in the context of g.named.player
    onCollideRoomTransition(thisGameObject, transitionObject)
    {
        // TODO 
        //console.log("This object, then transition object");
        //console.log(thisGameObject);
        //console.log(transitionObject);
        //console.log("left " + transitionObject.geom.left + " right " + transitionObject.geom.right);

        let isVerticalDoor = transitionObject.geom.height >= transitionObject.geom.width;
        var deltaX = this.gameObj.x - transitionObject.x;
        var deltaY = this.gameObj.y - transitionObject.y;

        let dest = transitionObject.getData("destination");

        if (dest == "turnOffMusic") {
            //console.log("Turn off music");
            stopLoop("music");
            return;
        }

        // Ensure we offset the correct direction or else we might end up in a wall or something.
        let directionStr = transitionObject.getData("direction");
        if (!directionStr) {
            directionStr = "center";
        }
        let offsetMap = {
            "left" : MakeVec2(-1, 0),
            "right": MakeVec2(1, 0),
            "up"   : MakeVec2(0, -1),
            "down" : MakeVec2(0, 1),
            "center": MakeVec2(0, 0),
        };

        let destObj = g.named.roomTransitionsByName[dest];

        if (!destObj)
        {
            //console.log("Could not find transition destination: " + dest);
            return;
        }
        this.gameObj.setPosition(
                destObj.x - offsetMap[directionStr].x * this.gameObj.width * g.scale,
                destObj.y - offsetMap[directionStr].y * this.gameObj.height * g.scale);

        // Make sure to recall boomie
        this.detachBoomie(/* animate? */ false);
    }

    update (time, delta)
    {
        var direction = MakeVec2(0, 0);
        let velocity = this.velocity;
        if (g.debug)
        {
            this.gameObj.body.checkCollision.none = this.noClipKey.isDown;
            if (this.noClipKey.isDown)
            {
                velocity *= 5;
            }
        }

        if (this.leftKey.isDown || this.joystick.left)
        {
            direction.x = -1;
        }
        else if (this.rightKey.isDown || this.joystick.right)
        {
            direction.x = 1;
        }

        if (this.upKey.isDown || this.joystick.up)
        {
            direction.y = -1;
        }
        else if (this.downKey.isDown || this.joystick.down)
        {
            direction.y = 1;
        }

        // Decide whether to pilot the path boomerang or not
        if (this.boomerangKey.keystroke() || this.pendingBoomieThrow)
        {
            // If we already threw a boomie, retract him.
            if (null != this.activeBoomie)
            {
                this.detachBoomie();
            }
            // If we were drawing a path, cancel it.
            else if (null != this.activeDrawPathBoomerang)
            {
                this.activeDrawPathBoomerang.destroy();
                this.activeDrawPathBoomerang = null;
            }
            // Otherwise, throw a path for dynamic drawing in the direction we were facing
            else
            {
                this.activeDrawPathBoomerang = new DrawPathBoomerang(g.fx.data.boomerang, 
                        MakeVec2(this.gameObj.x, this.gameObj.y), this.faceDirection);
            }

            this.pendingBoomieThrow = false;
        }
        
        // If we are drawing a path for boomie to follow, then update its movement.
        if (null != this.activeDrawPathBoomerang)
        {
            // pilot the boomerang path drawing
            this.activeDrawPathBoomerang.updateMovement(time, delta, direction);
            this.gameObj.setVelocity(0, 0);

            // time to make a real boomie?
            if (!this.activeDrawPathBoomerang.isPathValid())
            {
                this.activeDrawPathBoomerang.destroy();
                this.activeDrawPathBoomerang = null;
            }
            else if (this.activeDrawPathBoomerang.isPathComplete())
            {
                let finalPaths = this.activeDrawPathBoomerang.subpaths();
                let finalLoop = finalPaths[finalPaths.length - 1];

                const BOOMIE_SPEED = 5; // todo different speed boomies
                this.activeBoomiePolygon = new PathPolygon(finalLoop[0], 8, 0x80A020, true);
                this.activeBoomiePolygon.updatePathPoints(finalLoop);
                this.activeBoomie = new Boomerang(g.fx.data.boomerang, finalPaths[0][0]);

                var polygons = [];
                if (finalPaths.length > 1) {
                    var path = finalPaths[0];
                    var polygon = new PathPolygon(path[0], 8, 0x80A020, false);
                    polygon.updatePathPoints(path);
                    polygons.push(polygon.polygonObj);
                }
                polygons.push(this.activeBoomiePolygon.polygonObj);

                this.activeBoomie.setPositionProvider(Boomerang.lerpAlongPerimeter(BOOMIE_SPEED, true, ...polygons));
                var thisRef = this;
                g.engine.physics.add.collider(this.activeBoomie.gameObj, g.named.wallBlockers, function() {
                    // console.log("Boomie hit a wall!");
                    if (null !== thisRef.activeBoomie) 
                    {
                        playSFX("boomie_hit_wall");
                    }
                    thisRef.detachBoomie();
                }, null, g.engine);
                g.engine.physics.add.collider(this.activeBoomie.gameObj, g.named.interactables, function(boomie, interactable) {
                    // console.log("Boomie hit interactable", interactable.getOwner().fxData.id);
                    interactable.getOwner().tryActivate(boomie.getOwner());
                }, null, g.engine);

                this.activeDrawPathBoomerang.destroy();
                this.activeDrawPathBoomerang = null;
            }
        }
        else
        {
            // move normally
            this.gameObj.setVelocity(direction.x * velocity, direction.y * velocity);

            var dirMap = [
                /* -X */ [
                    /* -Y */ "dir:dl",
                    /* 0Y */ "dir:dl",
                    /* +Y */ "dir:ul",
                ],
        
                /* 0 X */ [
                    /* -Y */ "dir:dr",
                    /* 0Y */ "none",
                    /* +Y */ "dir:ur",
                ],
        
                /* +X */ [
                    /* -Y */ "dir:dr",
                    /* 0Y */ "dir:dr",
                    /* +Y */ "dir:ur",
                ]
            ]

            // If we are running, put in the run animation prefix
            var prefix = "";
            if (direction.length() > 0) {
                prefix = "run:";
            }
        
            var animToPlay = dirMap[direction.x + 1][-direction.y + 1]
        
            if (animToPlay != "none") 
            {
                this.faceDirection = direction;
                this.faceDirectionAnim = animToPlay;
                this.playAnim(prefix + animToPlay);
            }

            // NOTE: Nikolai was lazy and didn't want to draw out all of the run animations.
            if (prefix == "run:") {
                this.gameObj.flipX = direction.x < 0;
            }
            else {
                this.gameObj.flipX = false;
            }

            // Return to a steady state animation
            if (direction.length() == 0 && this.faceDirectionAnim != "" && this.faceDirectionAnim != "none") {
                this.playAnim(this.faceDirectionAnim);
            }
    
            if (this.swapSkinKey.keystroke())
            {
                this.swapSkin((this.altSkinIdx + 1) % this.altSkins.length);
            }
        }

        let spaceNames = ["space", "space2"];
        var boomieHelpAnim = ":static"
        if (this.activeBoomie) {
            boomieHelpAnim = ":static2";
        }

        if (this.lastBoomieHelpAnim != boomieHelpAnim) {
            this.lastBoomieHelpAnim = boomieHelpAnim;
            for (var spaceName of spaceNames) {

                if (this.activeBoomie) {
                    g.byName[spaceName].gameObj.anims.play(
                            g.byName[spaceName].fxData.id + this.lastBoomieHelpAnim, true);
                }
                else {
                    g.byName[spaceName].gameObj.anims.play(
                            g.byName[spaceName].fxData.id + this.lastBoomieHelpAnim, true);
                }
            }
        }

        this.maybeMoveCamera();
    }

    swapSkin(skinIdx)
    {
        this.altSkinIdx = skinIdx;
        this.fxData = this.altSkins[this.altSkinIdx];
        this.playAnim(this.faceDirectionAnim);
    }

    maybeMoveCamera ()
    {
        let camWidth = g.engine.cameras.main.width;
        let camHeight = g.engine.cameras.main.height;
        let screenStartX = Math.floor(this.gameObj.x / camWidth) * camWidth;
        let screenStartY = Math.floor(this.gameObj.y / camHeight) * camHeight;
        
        //console.log("Player pos " + this.gameObj.x + " , " + this.gameObj.y);
        //console.log("Camera moving to " + screenStartX + " , " + screenStartY);
        //console.log("Current camera pos " + g.engine.cameras.main.scrollX + " , " + g.engine.cameras.main.scrollY);

        // NOTE: Used cached values because "setScroll()" is expensive to call.
        if (this.cachedScreenStartX != screenStartX || this.cachedscreenStartY != screenStartY) {
            g.engine.cameras.main.setScroll(screenStartX, screenStartY);
            this.cachedScreenStartX = screenStartX;
            this.cachedscreenStartY = screenStartY;
        }
    }

    destroy()
    {
        // @TODO
        this.gameObj.destroy()
    }

}
