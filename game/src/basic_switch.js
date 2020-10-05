class BasicSwitch {

    constructor(
        /* FxObject */ fxData = null, 
        /* Phaser.Math.Vector2 */ pos = null,
        /* Object */ custData = null)
    {
        if (pos == null) {
            pos = MakeVec2(0, 0);
        }
        if (fxData == null) {
            fxData = g.fx.data.basic_switch;
        }
        
        this.fxData = fxData;
        this.custData = custData;

        this.gameObj = g.engine.physics.add.sprite(pos.x, pos.y, fxData.id).setScale(g.scale);
        this.gameObj.setOrigin(0, 1);
        this.gameObj.depth = g.layers.interactables;
        var thisRef = this;
        this.gameObj.getOwner = function() { return  thisRef; };
        this.active = false;
        this.activationCooldown = 0;
        this.setActive(false);

        if (g.debug) {
            this.gameObj.setInteractive();
            this.gameObj.on('pointerdown', function() {
                thisRef.tryActivate(thisRef);
            });
        }

        g.entities.push(this);
    }

    tryActivate(instigator)
    {
        this.setActive(!this.active);
        playSFX("hit_switch");
    }

    isActivated()
    {
        return this.active;
    }

    setActive(active)
    {
        if (this.activationCooldown <= 0)
        {
            var stateSwitched = this.active != active;
            this.active = active;
            if (active) {
                this.gameObj.anims.play(this.fxData.id + ':' + 'active', true);
            }
            else {
                this.gameObj.anims.play(this.fxData.id + ':' + 'inactive', true);
            }

            if (stateSwitched) {
                this.triggerListeners();
            }

            this.activationCooldown = 1000.0;
        }
    }

    triggerListeners()
    {
        if (this.custData && this.custData.receivers) {
            let receiverNames = this.custData.receivers.split(',');
            for (var name of receiverNames) {
                g.byName[name].tryActivate(this);
            }
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