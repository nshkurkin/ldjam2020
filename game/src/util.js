
class Util {
    static degToRad (degrees) {
        return degrees * Math.PI / 180.0;
    }

    static finishLoadAsset (json_name)
    {
        var phaser = g.engine;
        var data = phaser.cache.json.get(json_name);
    
        if (data.type == 'sprite-sheet')
        {
            for (var keyFrame of data.keyFrames) {
                if (keyFrame.len > 1) {
                    var frames = phaser.anims.generateFrameNumbers(data.id, 
                            { start:  keyFrame.start, end: keyFrame.start + keyFrame.len - 1 });
                    if (keyFrame.reversed) {
                        frames.reverse();
                    }
                    phaser.anims.create({
                        key: data.id + ":" + keyFrame.key,
                        frames: frames,
                        frameRate: keyFrame.rate,
                        repeat: keyFrame.repeat
                    });
                }
                else {
                    phaser.anims.create({
                        key: data.id + ":" + keyFrame.key,
                        frames: [ { key: data.id, frame: keyFrame.start } ],
                        frameRate: keyFrame.rate
                    });
                }
            }
        }
    
        return data;
    }

    static lerpVec2(u, a, b)
    {
        return MakeVec2((1 - u) * a.x + (u) * b.x, (1 - u) * a.y + (u) * b.y);
    }

    static pos(gameObj)
    {
        return MakeVec2(gameObj.x, gameObj.y);
    }

    // gets the value of a TiledObject custom property called propertyName
    static getTiledProperty(tiledObject, propertyName)
    {
        if (!("properties" in tiledObject))
        {
            return null;
        }

        for (var property of tiledObject.properties)
        {
            if (property.name === propertyName)
            {
                return property.value
            }
        }
        return null;
    }
}

function MakeVec2(x, y) {
    return new Phaser.Math.Vector2(x, y);
}

class KeyState {
    constructor(key)
    {
        this.key = key;
        this.pendingRelease = key.isDown;
    }

    keystroke()
    {
        var stroke = false;
        
        if (!this.key.isDown && this.pendingRelease)
        {
            this.pendingRelease = false;
        }

        if (this.key.isDown && !this.pendingRelease)
        {
            stroke = true;
            this.pendingRelease = true;
        }
        return stroke;
    }
}

function drawCollisionShapes (graphics, layer, scale)
{
    graphics.clear();

    // Loop over each tile and visualize its collision shape (if it has one)
    layer.forEachTile(function (tile)
    {
        var tileWorldX = tile.getLeft();
        var tileWorldY = tile.getTop();
        var collisionGroup = tile.getCollisionGroup();

        // console.log(collisionGroup);

        if (!collisionGroup || collisionGroup.objects.length === 0) { return; }

        // The group will have an array of objects - these are the individual collision shapes
        var objects = collisionGroup.objects;

        for (var i = 0; i < objects.length; i++)
        {
            var object = objects[i];
            var objectX = tileWorldX + object.x;
            var objectY = tileWorldY + object.y;

            // When objects are parsed by Phaser, they will be guaranteed to have one of the
            // following properties if they are a rectangle/ellipse/polygon/polyline.
            if (object.rectangle)
            {
                graphics.strokeRect(objectX, objectY, object.width * scale, object.height * scale);
            }
            else if (object.ellipse)
            {
                // Ellipses in Tiled have a top-left origin, while ellipses in Phaser have a center
                // origin
                graphics.strokeEllipse(
                    objectX + object.width / 2, objectY + object.height / 2,
                    object.width, object.height
                );
            }
            else if (object.polygon || object.polyline)
            {
                var originalPoints = object.polygon ? object.polygon : object.polyline;
                var points = [];
                for (var j = 0; j < originalPoints.length; j++)
                {
                    var point = originalPoints[j];
                    points.push({
                        x: objectX + point.x,
                        y: objectY + point.y
                    });
                }
                graphics.strokePoints(points);
            }
        }
    });
}