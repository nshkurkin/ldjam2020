
// Expected Globals:
// g.engine : PhaserEngine
// g.scale : float
// g.entities : list<EntityObject>
// g.fx.data.boomerang : FxObject

// This is the base class for the boomerang.
class Boomerang 
{
    constructor(
        /* FxObject */ fxData = null, 
        /* Phaser.Math.Vector2 */ pos = null)
    {
        if (pos == null) {
            pos = MakeVec2(0, 0);
        }
        if (fxData == null) {
            fxData = g.fx.data.boomerang;
        }
        
        this.gameObj = g.engine.physics.add.sprite(pos.x, pos.y, fxData.id).setScale(g.scale);
        this.gameObj.anims.play('spin', true);
        this.positionProvider = function() { return null; };
        
        g.entities.push(this);
    }

    update()
    {
        // Lerp to the provided position.
        var desiredPos = this.positionProvider();
        if (desiredPos != null) {
            var u = 0.7;
            this.gameObj.x = (u) * this.gameObj.x + (1.0 - u) * desiredPos.x;
            this.gameObj.y = (u) * this.gameObj.y + (1.0 - u) * desiredPos.y;
        }
    }

    destroy()
    {
        // @TODO
    }

}