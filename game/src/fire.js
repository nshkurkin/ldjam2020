class Fire {
    constructor(
        /* FxObject */ fxData = null,
        /* Vector2 */ startPos = null,
        /* phaser game object */ follow = null,
        /* function(bool) */ changeStateCallback = null)
    {
        if (fxData == null)
        {
            fxData = g.fx.data.fire;
        }
        if (null === startPos)
        {
            startPos = MakeVec2(0, 0);
        }
        
        this.fxData = fxData;
        this.currentPos = startPos;
        this.follow = follow;
        this.changeStateCallback = changeStateCallback;

        this.gameObj = g.engine.physics.add.sprite(startPos.x, startPos.y, fxData.id).setScale(g.scale);
        this.gameObj.setOrigin(0.5, 0.8);
        this.gameObj.depth = g.layers.effects;
        this.gameObj.anims.play(fxData.id + ':flicker', true)
        // todo fire on top of most things?
        //this.gameObj.depth = g.layers.interactables;
        this.gameObj.getOwner = function() { return  thisRef; };
        
        this.setActive(false);

        g.entities.push(this);
    }

    update (time, delta)
    {
        // smooth follow
        if (null !== this.follow)
        {
            this.currentPos = MakeVec2(this.follow.x, this.follow.y);
        }

        var u = 0.7;
        this.gameObj.setPosition(
                (u) * this.gameObj.x + (1.0 - u) * this.currentPos.x, 
                (u) * this.gameObj.y + (1.0 - u) * this.currentPos.y);
    }

    setActive (value)
    {
        this.isActive = value;
        this.gameObj.setAlpha(value ? 1 : 0);
        if (null !== this.changeStateCallback)
        {
            this.changeStateCallback(value);
        }
    }

    getActive ()
    {
        return this.isActive;
    }

    destroy ()
    {
        g.entities.splice(g.entities.indexOf(this), 1);
        this.gameObj.destroy();
    }
}