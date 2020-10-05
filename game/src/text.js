
class StaticText {

    constructor(
        /* FxObject */ fxData = null, 
        /* Phaser.Math.Vector2 */ pos = null,
        /* Object */ custData = null)
    {
        if (pos == null) {
            pos = MakeVec2(0, 0);
        }
        if (fxData == null) {
            fxData = g.fx.data.move;
        }
        
        this.fxData = fxData;
        this.custData = custData;

        this.gameObj = g.engine.physics.add.sprite(pos.x, pos.y, fxData.id).setScale(g.scale);
        this.gameObj.depth = g.layers.interactables;
        this.gameObj.setOrigin(0, 1);
        var thisRef = this;
        this.gameObj.getOwner = function() { return thisRef; };
        if (custData && custData.animate) {
            this.gameObj.anims.play(this.fxData.id + ":animate", true);
        }
        if (custData && custData.hidden) {
            this.gameObj.visible = !custData.hidden;
        }
    }

    tryActivate(instigator)
    {
        this.gameObj.visible = true;
    }

    isActivated()
    {
        return false;
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

