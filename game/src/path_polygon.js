// Expected Globals:
// g.engine : PhaserEngine
// g.scale : float
// g.entities : list<EntityObject>
// g.fx.data.boomerang : FxObject

// Class for rendering a boomie path
class PathPolygon {
    constructor(
        /* Vector2 */ startPos = null,
        strokeStyle = 6,
        strokeColor = 0xa0a0a0)
    {
        if (startPos === null)
        {
            startPos = MakeVec2(0, 0);
        }

        this.polygonObj = null;
        this.pathPoints = [startPos];

        this._refreshDrawnPolygon();
    }

    updatePolygonPoints (newPoints)
    {

    }

    _refreshDrawnPolygon ()
    {
        // delete and re add polygon. i cry every time
        if (null != drawnPathPolygon) {
            drawnPathPolygon.destroy();
        }
        drawnPathPolygon = g.engine.add.polygon(0, 0, drawnPathPoints);
        drawnPathPolygon.setStrokeStyle(6, 0xefc53f);
        drawnPathPolygon.setClosePath(false);
        drawnPathPolygon.displayOriginX = 0.5;
        drawnPathPolygon.displayOriginY = 0.5;

        g.named.boomie.positionProvider = Boomerang.lerpAlongPerimeter(drawnPathPolygon, /* speed */ 20);
    }
}
