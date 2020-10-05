

class FlammableBox {

    constructor(
        /* FxObject */ fxData = null, 
        /* Phaser.Math.Vector2 */ pos = null,
        /* Object */ custData = null)
    {
        if (pos == null) {
            pos = MakeVec2(0, 0);
        }
        if (fxData == null) {
            fxData = g.fx.data.box;
        }
        
        this.fxData = fxData;
        this.custData = custData;

        this.gameObj = g.engine.physics.add.sprite(pos.x, pos.y, fxData.id).setScale(g.scale);
        this.gameObj.depth = g.layers.interactables;
        this.gameObj.setOrigin(0, 1);
        var thisRef = this;
        this.gameObj.getOwner = function() { return thisRef; };

        this.ignited = false;
        let followOffset = MakeVec2(this.gameObj.width/2.0, -this.gameObj.height/2.0).scale(g.scale);
        this.fire = new Fire(g.fx.data.fire, pos, this.gameObj, followOffset, Util.withContext(this._onFireStateChanged, this));
    }

    tryActivate(instigator)
    {
        // Do nothing
    }

    isActivated()
    {
        return false;
    }

    _onFireStateChanged (value)
    {
        if (value)
        {
            // this should not loop because it will stop changing the fire state
            this.ignite();
        }
    }

    ignite()
    {
        if (this.ignited) {
            return;
        }

        this.ignited = true;

        // @TODO: Spawn fancier fire embers

        this.gameObj.anims.play(this.fxData.id + ":burn", true);
        var thisRef = this;
        setTimeout(function () { 
            thisRef.gameObj.anims.play(thisRef.fxData.id + ":destroy", true);
            setTimeout(function () { 
                thisRef.destroy();
            }, 0.5 * 1000.0);
        }, 1 * 1000.0);
    }

    update(time, delta)
    {
        // TODO
    }

    destroy()
    {
        this.fire.destroy();
        this.gameObj.destroy();
    }
}

