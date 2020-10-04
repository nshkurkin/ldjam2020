

class Torch {
    constructor(
        /* FxObject */ fxData = null, 
        /* Phaser.Math.Vector2 */ pos = null,
        /* Object */ custData = null)
    {
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
        this.fire = new Fire(g.fx.data.fire, pos, this.gameObj, followOffset);

        var thisRef = this;
        this.gameObj.getOwner = function() { return  thisRef; };
        if (custData){
            this.active = custData.lit;
        }
        this.setActive(this.active);

        g.entities.push(this);
    }

    tryActivate(instigator)
    {
        // @TODO: gate this with the "Flammable" actor
        var hitByFlammable = (instigator instanceof Boomerang);
        var shouldActivate = hitByFlammable;

        if (this.custData.activateIf) {
            let requiredNames = this.custData.activateIf.split(',');
            var allTrue = true;
            for (var name of requiredNames) {
                allTrue = allTrue && g.byName[name].isActivated();
            }
            shouldActivate = shouldActivate || allTrue;
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
        this.fire.setActive(active);
        if (active) {
            this.gameObj.anims.play(this.fxData.id + ':' + 'flicker', true);
        }
        else {
            this.gameObj.anims.play(this.fxData.id + ':' + 'unlit', true);
        }

        if (stateSwitched) {
            this.triggerListeners();
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
        
    }

    destroy()
    {
        this.setActive(false);
        this.fire.destroy();
    }
}
