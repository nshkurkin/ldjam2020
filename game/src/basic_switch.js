class BasicSwitch {

    constructor(
        /* FxObject */ fxData = null, 
        /* Phaser.Math.Vector2 */ pos = null)
    {
        if (pos == null) {
            pos = MakeVec2(0, 0);
        }
        if (fxData == null) {
            fxData = g.fx.data.basic_switch;
        }
        
        this.fxData = fxData;
        this.gameObj = g.engine.physics.add.sprite(pos.x, pos.y, fxData.id).setScale(g.scale);
        this.gameObj.depth = g.layers.interactables;
        var thisRef = this;
        this.gameObj.getOwner = function() { return  thisRef; };
        this.active = false;
        this.activationCooldown = 0;
        this.setActive(false);

        g.entities.push(this);
    }

    tryActivate(instigator)
    {
        this.setActive(!this.active);
    }

    setActive(active)
    {
        if (this.activationCooldown <= 0)
        {
            this.active = active;
            if (active) {
                this.gameObj.anims.play(this.fxData.id + ':' + 'active', true);
            }
            else {
                this.gameObj.anims.play(this.fxData.id + ':' + 'inactive', true);
            }

            this.activationCooldown = 1000.0;
        }
    }

    update(time, delta)
    {
        if (this.activationCooldown > 0)
        {
            this.activationCooldown -= delta;
        }
    }

    destroy()
    {
        // TODO
    }
}