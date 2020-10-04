
class Door {
    constructor(
        /* FxObject */ fxData = null, 
        /* Phaser.Math.Vector2 */ pos = null)
    {
        if (pos == null) {
            pos = MakeVec2(0, 0);
        }
        if (fxData == null) {
            fxData = g.fx.data.door;
        }
        
        this.fxData = fxData;
        this.gameObj = g.engine.physics.add.sprite(pos.x, pos.y, fxData.id).setScale(g.scale);
        this.gameObj.depth = g.layers.interactables;
        var thisRef = this;
        this.gameObj.getOwner = function() { return  thisRef; };
        this.open = false;
        this.setOpen(false);

        g.entities.push(this);
    }

    tryActivate(instigator)
    {
        // Do nothing
    }

    setOpen(open)
    {
        if (this.open != open) {
            if (open) {
                this.gameObj.anims.play(this.fxData.id + ':' + 'opening', true);
            }
            else {
                this.gameObj.anims.play(this.fxData.id + ':' + 'closing', true);
            }
        }
        else {
            if (open) {
                this.gameObj.anims.play(this.fxData.id + ':' + 'opened', true);
            }
            else {
                this.gameObj.anims.play(this.fxData.id + ':' + 'closed', true);
            }
        }
        this.open = open;
    }
}