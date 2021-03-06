

class Torch extends GameEntity {
    constructor(
        /* FxObject */ fxData = null, 
        /* Phaser.Math.Vector2 */ pos = null,
        /* Object */ custData = null)
    {
        super();

        if (pos == null) {
            pos = MakeVec2(0, 0);
        }
        if (fxData == null) {
            fxData = g.fx.data.torch;
        }
        
        this.fxData = fxData;
        this.custData = custData;

        this.gameObj = g.engine.physics.add.sprite(pos.x, pos.y, fxData.id).setScale(g.scale);
        this.gameObj.setOrigin(0, 1);
        this.gameObj.depth = g.layers.interactables;

        let followOffset = MakeVec2(this.gameObj.width * 0.5, -this.gameObj.height * 0.7).scale(g.scale);
        this.fire = new Fire(g.fx.data.fire, pos, this.gameObj, followOffset, Util.withContext(this._onFireStateChanged, this));

        var thisRef = this;
        this.gameObj.getOwner = function() { return  thisRef; };
        this.active = false;
        if (custData && "lit" in custData)
        {
            this.setActive(custData.lit);
        }
        else
        {
            this.setActive(this.active);
        }
    }

    _onFireStateChanged (value)
    {
        //console.log("callback this");
        //console.log(this);
        //console.log("Callback value: " + value);

        if (value)
        {
            // this should not loop because it will stop changing the fire state
            this.setActive(true);
        }
    }

    tryActivate(instigator = null)
    {
        // @TODO: gate this with the "Flammable" actor
        //var hitByFlammable = (instigator instanceof Boomerang);
        //var shouldActivate = hitByFlammable;
        var shouldActivate = false;

        if (this.custData.activateIf) {
            let requiredNames = this.custData.activateIf.split(',');
            var allTrue = true;
            for (var name of requiredNames) {
                allTrue = allTrue && g.byName[name].isActivated();
            }
            shouldActivate = shouldActivate || allTrue;
        }

        if (!this.custData.activateIf && (instigator instanceof Torch || instigator instanceof BasicSwitch)) {
            shouldActivate = true;
        }

        if (shouldActivate) {
            this.setActive(true);
        }
    }
    
    isActivated()
    {
        return this.active;
    }

    setActive(active)
    {
        var stateSwitched = this.active != active;
        this.active = active;
        if (active) {
            this.gameObj.anims.play(this.fxData.id + ':' + 'flicker', true);
        }
        else {
            this.gameObj.anims.play(this.fxData.id + ':' + 'unlit', true);
        }
        
        if (stateSwitched) {
            // prevent recursion by only doing this on state switch
            this.fire.setActive(active);
            this.triggerListeners();
        }
    }

    triggerListeners()
    {
        //console.log("Torch triggered");
        if (this.custData && this.custData.receivers) {
            let receiverNames = this.custData.receivers.split(',');
            //console.log("Torch receivers: ", receiverNames);
            for (var name of receiverNames) {
                g.byName[name].tryActivate(this);
            }
        }

        if (this.active && this.custData && this.custData.turnOnMusic) {
            console.log("Restart music");
            playLoop("music");
        }
    }

    update(time, delta)
    {
        super.update(time, delta);
    }

    destroy()
    {
        this.setActive(false);
        this.fire.destroy();
        super.destroy();
    }
}
