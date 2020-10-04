class Fire {
    constructor(
        /* FxObject */ fxData = null,
        /* Vector2 */ startPos = null,
        /* phaser game object */ follow = null,
        /* Vector2 */ followOffset = null,
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
        if (null === followOffset)
        {
            followOffset = MakeVec2(0, 0);
        }
        
        this.fxData = fxData;
        this.currentPos = startPos;
        this.follow = follow;
        this.followOffset = followOffset;
        this.changeStateCallback = changeStateCallback;
        
        // override startPos if following something
        if (null != follow)
        {
            startPos = this._getFollowPos();
        }

        this.gameObj = g.engine.physics.add.sprite(startPos.x, startPos.y, fxData.id).setScale(g.scale);
        this.gameObj.setOrigin(0.5, 0.8);
        this.gameObj.depth = g.layers.effects;
        this.gameObj.anims.play(fxData.id + ':flicker', true)

        g.named.fires.add(this.gameObj);
        // todo fire on top of most things?
        //this.gameObj.depth = g.layers.interactables;
        var thisRef = this;
        this.gameObj.getOwner = function() { return  thisRef; };
        
        this.setActive(false);

        g.entities.push(this);
    }

    update (time, delta)
    {
        // smooth follow
        if (null !== this.follow)
        {
            this.currentPos = this._getFollowPos();
        }

        var u = 0.7;
        this.gameObj.setPosition(
                (u) * this.gameObj.x + (1.0 - u) * this.currentPos.x, 
                (u) * this.gameObj.y + (1.0 - u) * this.currentPos.y);
    }

    _getFollowPos ()
    {
        return MakeVec2(this.follow.x + this.followOffset.x, this.follow.y + this.followOffset.y);
    }

    setActive (value)
    {
        value = value || false; // There is an undefined coming from somewhere...clean up
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

    static onCollideFires (fireObj1, fireObj2)
    {
        let fire1 = fireObj1.getOwner();
        let fire2 = fireObj2.getOwner();
        //console.log("fires");
        //console.log(fire1);
        //console.log(fire2);
        // if the fires have a different state, one of them is lit
        if (fire1.getActive() !== fire2.getActive())
        {
            fire1.setActive(true);
            fire2.setActive(true);
        }
    }
}