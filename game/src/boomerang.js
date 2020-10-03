
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
        this.gameObj.anims.play(fxData.id + ':' + 'spin', true);
        this.positionProvider = Boomerang.disableLerpFunc();
        
        g.entities.push(this);
    }

    update(time, delta)
    {
        // Lerp to the provided position.
        var desiredPos = this.positionProvider(time, delta);
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

    static disableLerpFunc()
    {
        return function(time, delta) { return null; };
    }

    static lerpToMouseFunc()
    {
        return function(time, delta) { return g.game.input.mousePointer; };
    }

    static lerpAlongPerimeter(
        polygon /* Phaser.GameObjects.Polygon */,
        speed /* float, pixels-per-second */)
    {
        // If there there are no points, then early exit.
        if (polygon.geom.points.length <= 1) {
            return Boomerang.disableLerpFunc();
        }
        
        var stepRate = 10.0 /* pixels-per-segment */;
        var samples = Phaser.Geom.Polygon.GetPoints(polygon.geom, /* quantity */ 0, stepRate);
        // NOTE: clock time in milliseconds
        var timeElapsed = 0;
        // @FIXME: Not sure why "50", but it makes the timescale behave more like expected.
        var duration = 1000.0 * (samples.length * stepRate) / (speed * 50);
        return function(time, delta) {
            // @FIXME: If you run this really slowly, the boomerang jumps back and forth.
            var u = Math.min(timeElapsed / duration, 1.0);
            var whichSegment = Math.floor(u * (samples.length - 1));
            
            var a = samples[whichSegment];
            if (whichSegment >= samples.length - 1) {
                return a;
            }
            var b = samples[whichSegment + 1];
            var subU = (u * samples.length) % 1;

            timeElapsed += delta;

            return Util.lerpVec2(subU, a, b);
        };
    }

}