
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
        this.setPositionProvider(Boomerang.disableLerpFunc());
        
        g.entities.push(this);
    }

    update(time, delta)
    {
        // Lerp to the provided position.
        var desiredPos = this.positionProvider(time, delta, /* destroy? */ false);
        if (desiredPos != null) {
            var u = 0.7;
            this.gameObj.setPosition(
                    (u) * this.gameObj.x + (1.0 - u) * desiredPos.x, 
                    (u) * this.gameObj.y + (1.0 - u) * desiredPos.y);
        }
    }

    destroy()
    {
        this.setPositionProvider(function(time, delta, destroy) { 
            return MakeVec2(g.named.player.gameObj.x, g.named.player.gameObj.y); 
        });
        const SPEED = 20; /* pixels-per-second */
        const DURATION = 1000.0 * MakeVec2(g.named.player.gameObj.x, g.named.player.gameObj.y).subtract(
                MakeVec2(this.gameObj.x, this.gameObj.y)).length() / (50.0 * SPEED);
        var thisRef = this;
        setTimeout(function () { 
            g.entities.splice(g.entities.indexOf(thisRef), 1);
            thisRef.gameObj.destroy(); 
        }, DURATION);
    }

    setPositionProvider(theFunc)
    {
        if (this.positionProvider != null) {
            this.positionProvider(0, 0, /* destroy? */ true);
        }
        this.positionProvider = theFunc;
    }

    static disableLerpFunc()
    {
        return function(time, delta, destroy) { return null; };
    }

    static lerpToMouseFunc()
    {
        return function(time, delta, destroy) { return g.game.input.mousePointer; };
    }

    static lerpAlongPerimeter(
        speed /* float, pixels-per-second */,
        loop /* bool */,
        ...polygons /* [Phaser.GameObjects.Polygon] */)
    {
        // If there there are no points, then early exit.
        if (polygons.length == 0 || polygons[polygons.length - 1].geom.points.length <= 1) {
            return Boomerang.disableLerpFunc();
        }
        
        var stepRate = 10.0 /* pixels-per-segment */;
        var sampleSets = []
        var sampleDurations = []
        var whichSampleSet = 0;
        // NOTE: clock time in milliseconds
        var timeElapsed = 0;
        for (var polygon of polygons) {
            var samples = Phaser.Geom.Polygon.GetPoints(polygon.geom, /* quantity */ 0, stepRate);
            // NOTE: The Perimeter function treats it like a closed loop. So we need to ignore some segments.
            var closeLoopLength = samples.length * stepRate;
            var first = polygon.geom.points[0];
            var last = polygon.geom.points[polygon.geom.points.length - 1];
            var finalSegmentLength = MakeVec2(last.x, last.y).subtract(MakeVec2(first.x, first.y)).length();
            if (finalSegmentLength > 10) {
                var realLastSegment = Math.floor((closeLoopLength - finalSegmentLength) / stepRate);
                samples = samples.slice(0, realLastSegment);
            }
            sampleSets.push(samples);
            // @FIXME: Not sure why "50", but it makes the timescale behave more like expected.
            sampleDurations.push(1000.0 * (samples.length * stepRate) / (speed * 50));
        }

        return function(time, delta, destroy) {

            if (destroy) {
                var idx = whichSampleSet;
                while (idx < sampleSets.length - 1) {
                    polygons[idx].destroy();
                    idx += 1;
                }
                return null;
            }

            timeElapsed += delta;
            if (timeElapsed > sampleDurations[whichSampleSet] && whichSampleSet + 1 < sampleSets.length) {
                polygons[whichSampleSet].destroy();
                whichSampleSet += 1;
                timeElapsed = 0;
            }
            var duration = sampleDurations[whichSampleSet];
            var samples = sampleSets[whichSampleSet];

            // @FIXME: If you run this really slowly, the boomerang jumps back and forth.
            var u = timeElapsed / duration;
            if (loop && whichSampleSet == sampleSets.length - 1)
            {
                u = u % 1;
            }
            else
            {
                u = Math.min(u, 1.0);
            }
            var whichSegment = Math.floor(u * (samples.length - 1));
            
            var a = samples[whichSegment];
            if (whichSegment >= samples.length - 1) {
                return a;
            }
            var b = samples[whichSegment + 1];
            var subU = (u * samples.length) % 1;

            return Util.lerpVec2(subU, a, b);
        };
    }

}