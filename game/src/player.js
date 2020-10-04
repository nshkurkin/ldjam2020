
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
        this.gameObj.setCollideWorldBounds(true);
        this.gameObj.body.offset.y = this.gameObj.body.height / 2.0;
        this.gameObj.body.setSize(
                /* size */ this.gameObj.body.width, this.gameObj.body.height / 2.0, 
                /* centered? */ false);

        this.velocity = 100;
        this.faceDirection = MakeVec2(1, -1);
        this.faceDirectionAnim = this.fxData.id + ':dir:dr';
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
        this.swapSkinKey = new KeyState(g.engine.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FORWARD_SLASH));
    }

    playAnim(keyframeId)
    {
        this.gameObj.anims.play(this.fxData.id + ':' + keyframeId, true);
    }

    update (time, delta)
    {
        var direction = MakeVec2(0, 0);

        if (this.leftKey.isDown)
        {
            direction.x = -1;
        }
        else if (this.rightKey.isDown)
        {
            direction.x = 1;
        }

        if (this.upKey.isDown)
        {
            direction.y = -1;
        }
        else if (this.downKey.isDown)
        {
            direction.y = 1;
        }

        // decide whether to pilot the path boomerang or not
        if (this.boomerangKey.keystroke())
        {
            // throw the drawpath, or retrieve the drawpath, or retrieve the real boomie
            if (null != this.activeBoomie)
            {
                this.activeBoomie.destroy();
                this.activeBoomie = null;
                this.activeBoomiePolygon.destroy();
                this.activeBoomiePolygon = null;
            }
            else if (null != this.activeDrawPathBoomerang)
            {
                this.activeDrawPathBoomerang.destroy();
                this.activeDrawPathBoomerang = null;
            }
            else
            {
                this.activeDrawPathBoomerang = new DrawPathBoomerang(g.fx.data.boomerang, MakeVec2(this.gameObj.x, this.gameObj.y), direction);
            }
        }
        
        if (null != this.activeDrawPathBoomerang)
        {
            // pilot the boomerang path drawing
            this.activeDrawPathBoomerang.updateMovement(time, delta, direction);
            this.gameObj.setVelocity(0, 0);

            // time to make a real boomie?
            if (this.activeDrawPathBoomerang.isPathComplete())
            {
                let finalPath = this.activeDrawPathBoomerang.currentPath;

                const BOOMIE_SPEED = 5; // todo different speed boomies
                this.activeBoomiePolygon = new PathPolygon(finalPath[0], 8, 0x80A020, true);
                this.activeBoomiePolygon.updatePathPoints(finalPath);
                this.activeBoomie = new Boomerang(g.fx.data.boomerang, finalPath[0]);
                this.activeBoomie.positionProvider = Boomerang.lerpAlongPerimeter(this.activeBoomiePolygon.polygonObj, BOOMIE_SPEED, true);

                this.activeDrawPathBoomerang.destroy();
                this.activeDrawPathBoomerang = null;
            }
        }
        else
        {
            // move normally
            this.gameObj.setVelocity(direction.x * this.velocity, direction.y * this.velocity);
        }

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
    
        var animToPlay = dirMap[direction.x + 1][-direction.y + 1]
    
        if (animToPlay != "none") 
        {
            this.faceDirection = direction;
            this.faceDirectionAnim = animToPlay;
            this.playAnim(animToPlay);
        }

        if (this.swapSkinKey.keystroke())
        {
            this.altSkinIdx = (this.altSkinIdx + 1) % this.altSkins.length;
            this.fxData = this.altSkins[this.altSkinIdx];
            this.playAnim(this.faceDirectionAnim);
        }
    }

    destroy()
    {
        // @TODO
        this.gameObj.destroy()
    }

}