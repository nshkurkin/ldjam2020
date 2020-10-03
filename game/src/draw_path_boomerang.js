
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
        
        this.polygon = new PathPolygon(pos);

        this.gameObj = g.engine.physics.add.sprite(pos.x, pos.y, fxData.id).setScale(g.scale);
        this.gameObj.anims.play(fxData.id + ':' + 'static', true);
        this.gameObj.alpha = 0.5;

        this.speed = 200; 
        this.currentDirection = dir;
        this.currentPath = [pos];
        this.SEGMENT_DISTANCE = 20;
        
        //g.entities.push(this);

        // TODO chris: maybe make this a pos provider for a real boomie so you can use it to hit switches still?
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
        let lastPathPoint = this.currentPath[this.currentPath.length - 1];
        if (pos.distance(lastPathPoint) >= this.SEGMENT_DISTANCE)
        {
            this.currentPath.push(pos);
        }
        // todo draw the path with a polygon
        this.polygon.updatePathPoints([...this.currentPath, pos]);
    }

    // returns true if the path can create a loop now
    isPathComplete()
    {
        const MIN_NODES = 6;
        const CLOSED_LOOP_DIST = 40;

        let playerPos = Util.pos(g.named.player.gameObj);
        let lastPathPoint = this.currentPath[this.currentPath.length - 1];
        return this.currentPath.length >= MIN_NODES && lastPathPoint.distance(playerPos) <= CLOSED_LOOP_DIST;
    }

    // returns false if the path is too long or is otherwise broken
    isPathValid()
    {
        // TODO
        return true;
    }

    destroy()
    {
        this.polygon.destroy();
        this.polygon = null;
        this.gameObj.destroy();
    }

}