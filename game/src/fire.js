class Fire extends GameEntity {
    constructor(
        /* FxObject */ fxData = null,
        /* Vector2 */ startPos = null,
        /* phaser game object */ follow = null,
        /* Vector2 */ followOffset = null,
        /* function(bool) */ changeStateCallback = null)
    {
        super();

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

        g.named.tinder.add(this.gameObj);
        // todo fire on top of most things?
        //this.gameObj.depth = g.layers.interactables;
        var thisRef = this;
        this.gameObj.getOwner = function() { return  thisRef; };
        
        this.allowPropagation = true;
        this.PROPAGATION_DELAY = 300;

        // hack to fix sound
        this.allowSound = false;
        this.setActive(false);
    }

    update (time, delta)
    {
        super.update(time, delta);

        if (!this.gameObj.visible) {
            return;
        }

        this.allowSound = true;
        // smooth follow
        if (null !== this.follow)
        {
            this.currentPos = this._getFollowPos();
        }

        let u = 0.7;
        let newPos = MakeVec2(
                (u) * this.gameObj.x + (1.0 - u) * this.currentPos.x, 
                (u) * this.gameObj.y + (1.0 - u) * this.currentPos.y);

        if (this.gameObj.x != newPos.x || this.gameObj.y != newPos.y) {
            this.gameObj.setPosition(newPos.x, newPos.y);
        }
    }

    _getFollowPos ()
    {
        return MakeVec2(this.follow.x + this.followOffset.x, this.follow.y + this.followOffset.y);
    }

    setActive (value)
    {
        value = value || false; // @FIXME: There is an undefined coming from somewhere...clean up
        if (this.isActive != value)
        {
            if (value)
            {
                g.named.tinder.remove(this.gameObj);
                g.named.fires.add(this.gameObj);

                if (this.allowSound)
                {
                    playSFX("set_fire");
                }
                this.allowPropagation = false;
                setTimeout(Util.withContext(function () { this.allowPropagation = true; }, this), this.PROPAGATION_DELAY);
            }
            else {
                g.named.fires.remove(this.gameObj);
                g.named.tinder.add(this.gameObj);
            }
        }
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
        super.destroy();
    }

    static onCollideFires (fireObj1, fireObj2)
    {
        let fire1 = fireObj1.getOwner();
        let fire2 = fireObj2.getOwner();
        let fire1Active = fire1.getActive() && fire1.allowPropagation;
        let fire2Active = fire2.getActive() && fire2.allowPropagation;
        
        // if the fires have a different state, one of them is lit
        if (fire1Active !== fire2Active)
        {
            fire1.setActive(true);
            fire2.setActive(true);
        }
    }
}