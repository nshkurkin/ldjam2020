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

        this.optionalDuration = 0;
        this.durationTimeout = null;
        this.activeAnim = "active";
        this.inactiveAnim = "inactive";
        if (null !== custData && "duration" in custData)
        {
            this.optionalDuration = custData.duration;
            this.activeAnim = "active_timed";
            this.inactiveAnim = "inactive_timed";
        }

        if (g.debug) {
            this.gameObj.setInteractive();
            this.gameObj.on('pointerdown', function() {
                thisRef.tryActivate(thisRef);
            });
        }
        
        this.setActive(false);

        g.entities.push(this);
    }

    tryActivate(instigator)
    {
        if (this.optionalDuration > 0)
        {
            this.setActive(true);
        }
        else
        {
            this.setActive(!this.active);
        }
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
                this.gameObj.anims.play(this.fxData.id + ':' + this.activeAnim, true);
            }
            else {
                this.gameObj.anims.play(this.fxData.id + ':' + this.inactiveAnim, true);
            }
            
            // timed switch
            if (this.optionalDuration > 0 ) 
            {
                if (active)
                {
                    if (stateSwitched)
                    {
                        playLoop("switch_tick");
                    }
                    if (null !== this.durationTimeout)
                    {
                        clearTimeout(this.durationTimeout);
                    }
                    //console.log("Switch has ", this.optionalDuration, " ms");
                    this.durationTimeout = setTimeout(Util.withContext(function ()
                    {
                        this.durationTimeout = null;
                        this.setActive(false);
                    }, this), this.optionalDuration);
                }
                else
                {
                    stopLoop("switch_tick");
                }
            }

            if (stateSwitched) {
                this.triggerListeners();
                playSFX("hit_switch");
            }

            this.activationCooldown = 500.0;
        }
    }

    triggerListeners()
    {
        if (this.custData && this.custData.receivers) {
            let receiverNames = this.custData.receivers.split(',');
            for (var name of receiverNames) {
                let thing = g.byName[name];
                if (thing) {
                    thing.tryActivate(this);
                }
                else {
                    console.log("Unknown name: ", name);
                }
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