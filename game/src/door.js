
class Door {
    constructor(
        /* FxObject */ fxData = null, 
        /* Phaser.Math.Vector2 */ pos = null,
        /* Object */ custData = null)
    {
        if (pos == null) {
            pos = MakeVec2(0, 0);
        }
        if (fxData == null) {
            fxData = g.fx.data.door;
        }
        
        this.fxData = fxData;
        this.custData = custData;

        this.gameObj = g.engine.physics.add.sprite(pos.x, pos.y, fxData.id).setScale(g.scale);
        this.gameObj.setOrigin(0, 1);
        this.gameObj.depth = g.layers.interactables;
        var thisRef = this;
        this.gameObj.getOwner = function() { return  thisRef; };
        if (custData) {
            this.open = custData.open;
        }
        this.setOpen(this.open);

        g.entities.push(this);
    }

    tryActivate(instigator)
    {
        if (instigator instanceof Boomerang) {
            return;
        }

        var shouldActivate = true;

        if (this.custData.activateIf) {
            let requiredNames = this.custData.activateIf.split(',');
            var allTrue = true;
            for (var name of requiredNames) {
                allTrue = allTrue && g.byName[name].isActivated();
            }
            shouldActivate = shouldActivate && allTrue;
        }

        if (shouldActivate) {
            this.setOpen(!this.open);
        }
    }

    setOpen(open)
    {
        if (this.open != open) {
            playSFX("door_open");
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
        if (this.open) {
            g.named.wallBlockers.remove(this.gameObj);
        }
        else {
            g.named.wallBlockers.add(this.gameObj);
        }
    }

    update(time, delta)
    {
        // TODO
    }

    destroy()
    {
        // TODO
    }
}