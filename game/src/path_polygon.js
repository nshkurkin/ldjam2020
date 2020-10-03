// Expected Globals:
// g.engine : PhaserEngine
// g.scale : float
// g.entities : list<EntityObject>
// g.fx.data.boomerang : FxObject

// Class for rendering a boomie path
class PathPolygon {
    constructor(
        /* Vector2 */ startPos = null,
        strokeWidth = 6,
        strokeColor = 0xa0a0a0,
        closedPath = false)
    {
        if (startPos === null)
        {
            startPos = MakeVec2(0, 0);
        }

        this.polygonObj = null;
        this.pathPoints = [startPos];

        this.strokeWidth = strokeWidth;
        this.strokeColor = strokeColor;
        this.closedPath = closedPath;

        this._refreshDrawnPolygon();
    }

    setClosedPath (closed)
    {
        this.closedPath = closed;
    }

    updatePathPoints (newPoints)
    {
        this.pathPoints = [...newPoints]; // performs a shallow copy
        this._refreshDrawnPolygon();
    }

    destroy ()
    {
        if (null != this.polygonObj)
        {
            this.polygonObj.destroy();
        }
    }

    _refreshDrawnPolygon ()
    {
        // delete and re add polygon. i cry every time
        if (null != this.polygonObj)
        {
            this.polygonObj.destroy();
        }
        this.polygonObj = g.engine.add.polygon(0, 0, this.pathPoints);
        this.polygonObj.setStrokeStyle(this.strokeWidth, this.strokeColor);
        this.polygonObj.setClosePath(this.closedPath);
        this.polygonObj.displayOriginX = 0.5;
        this.polygonObj.displayOriginY = 0.5;
    }

}
