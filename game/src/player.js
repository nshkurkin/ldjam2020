
// Expected Globals:
// g.engine : PhaserEngine
// g.scale : float
// g.entities : list<EntityObject>
// g.fx.data.player : FxObject

// This is the base class for the boomerang.
class Player 
{
    constructor(
        /* FxObject */ fxData = null, 
        /* Phaser.Math.Vector2 */ pos = null)
    {
        if (pos == null) {
            pos = MakeVec2(0, 0);
        }
        //if (fxData == null) {
        //    fxData = g.fx.data.player;
        //}
        
        //this.gameObj = g.engine.physics.add.sprite(pos.x, pos.y, fxData.id).setScale(g.scale);
        //this.gameObj.anims.play('d:down', true);

        //g.entities.push(this);
    }

    update(time, delta)
    {
        // @TODO
    }

    destroy()
    {
        // @TODO
    }

}