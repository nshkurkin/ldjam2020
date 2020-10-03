
// Expected Globals:
// g.engine : PhaserEngine
// g.scale : float
// g.entities : list<EntityObject>
// g.fx.data.boomerang : FxObject

// This is the visual boomerang that shows up as you draw a path - not the same as the actual boomerang
class DrawPathBoomerang 
{
    constructor(
        /* FxObject */ fxData = null, 
        /* Vector2 */ pos = null,
        /* Vector2 */ dir = null) // chris: need speed as well? dunno
    {
        if (fxData === null)
        {
            fxData = g.fx.data.boomerang;
        }
        if (pos === null)
        {
            pos = MakeVec2(0, 0);
        }
        if (dir === null || dir.equals(Phaser.Math.Vector2.ZERO))
        {
            dir = MakeVec2(1, 0);
        }
        
        this.gameObj = g.engine.physics.add.sprite(pos.x, pos.y, fxData.id).setScale(g.scale);
        this.gameObj.anims.play(fxData.id + ':' + 'spin', true);
        // TODO do a polygon like the real boomerang

        this.speed = 200; 
        this.currentDirection = dir;
        this.currentPath = [pos];
        this.SEGMENT_DISTANCE = 20;
        
        //g.entities.push(this);
    }

    updateMovement(time, delta, dir)
    {
        if (!dir.equals(Phaser.Math.Vector2.ZERO))
        {
            this.currentDirection = dir;
        }
        this.gameObj.setVelocity(this.currentDirection.x * this.speed, this.currentDirection.y * this.speed)
        // todo crash into walls
        let pos = MakeVec2(this.gameObj.x, this.gameObj.y);
        let lastPathPoint= this.currentPath[this.currentPath.length - 1];
        if (pos.distance(lastPathPoint) >= this.SEGMENT_DISTANCE)
        {
            this.currentPath.push(pos);
        }
        // todo draw the path with a polygon
    }

    // returns true if the path can create a loop now
    isPathComplete()
    {
        // TODO
        return false;
    }

    // returns false if the path is too long or is otherwise broken
    isPathValid()
    {
        // TODO
        return true;
    }

    destroy()
    {
        const DURATION = 200;
        g.engine.tweens.add({
            targets: this.gameObj,
            x: g.named.player.gameObj.x,
            y: g.named.player.gameObj.y,
            duration: DURATION,
            ease: 'Sine.easeIn',
        });
        var thisRef = this;
        setTimeout(function () { thisRef.gameObj.destroy(); }, DURATION);
    }

}