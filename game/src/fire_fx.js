class FireFX {
    constructor(
        /* FxObject */ fxData = null,
        /* Vector2 */ startPos = null,
        /* phaser game object */ follow = null)
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

        this.gameObj = g.engine.physics.add.sprite(pos.x, pos.y, fxData.id).setScale(g.scale);
        // todo fire on top of most things?
        //this.gameObj.depth = g.layers.interactables;
        
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

    destroy ()
    {
        g.entities.splice(g.entities.indexOf(this), 1);
        this.gameObj.destroy();
    }
}