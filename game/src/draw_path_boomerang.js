
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
        this.gameObj.anims.play(fxData.id + ':' + 'spin', true);
        this.gameObj.alpha = 0.5;
        
        this.speed = 200; 
        this.currentDirection = dir;
        this.currentPath = [pos];
        this.intersectionIndices = [];
        this.SEGMENT_DISTANCE = 20;
        
        playSFX("boomie_target");

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

        // Figure out if any of the segments intersect. If they do then we note where.
        let lastSegment = new Phaser.Geom.Line(lastPathPoint.x, lastPathPoint.y, pos.x, pos.y);
        var idx = 0;
        // NOTE: " - 3 " because we want to skip the last segment, plus the previous one.
        while (idx < this.currentPath.length - 3) 
        {
            var intersectionPoint = new Phaser.Geom.Point(0, 0);
            let segment = new Phaser.Geom.Line(this.currentPath[idx].x, this.currentPath[idx].y, 
                        this.currentPath[idx + 1].x, this.currentPath[idx + 1].y);
            if (Phaser.Geom.Intersects.LineToLine(lastSegment, segment, intersectionPoint)) {
                console.log("Path self-intersected!");
                this.intersectionIndices.push({ idx: idx, pos: intersectionPoint });
                break;
            }

            idx += 1;
        }

    }

    // returns true if the path can create a loop now
    isPathComplete()
    {
        const MIN_NODES = 6;
        return this.currentPath.length >= MIN_NODES && this.intersectionIndices.length > 0;
    }

    subpaths()
    {
        var paths = [];

        if (this.intersectionIndices.length > 0) {
            var startingLoop = this.currentPath.slice(0, this.intersectionIndices[0].idx + 1);
            var endLoop = this.currentPath.slice(this.intersectionIndices[0].idx);

            startingLoop[startingLoop.length - 1] = MakeVec2(this.intersectionIndices[0].pos.x, this.intersectionIndices[0].pos.y);
            endLoop[0] = MakeVec2(this.intersectionIndices[0].pos.x, this.intersectionIndices[0].pos.y);

            paths.push(startingLoop);
            paths.push(endLoop);
        }
        else {
            paths.push(this.currentPath);
        }

        return paths;
    }

    // returns false if the path is too long or is otherwise broken
    isPathValid()
    {
        // TODO
        //console.log("Camera stuff");
        //console.log("x " + this.gameObj.x + " y " + this.gameObj.y);
        //console.log(g.engine.cameras.main.scrollX)
        //console.log(g.engine.cameras.main.scrollY)
        //console.log(g.engine.cameras.main.width)
        //console.log(g.engine.cameras.main.height)
        // make sure boomie is in bounds
        return this.gameObj.x > g.engine.cameras.main.scrollX
            && this.gameObj.x < g.engine.cameras.main.scrollX + g.engine.cameras.main.width
            && this.gameObj.y > g.engine.cameras.main.scrollY 
            && this.gameObj.y < g.engine.cameras.main.scrollY + g.engine.cameras.main.height;
    }

    destroy()
    {
        this.polygon.destroy();
        this.polygon = null;
        this.gameObj.destroy();
    }

}