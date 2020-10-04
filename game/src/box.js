

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
        var thisRef = this;
        this.gameObj.getOwner = function() { return thisRef; };

        this.ignited = false;
    }

    tryActivate(instigator)
    {
        // @TODO: Make this tied to being flammable.
        if (instigator instanceof Boomerang) {
            this.ignite();
        }
    }

    isActivated()
    {
        return false;
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
        this.gameObj.destroy();
    }
}

