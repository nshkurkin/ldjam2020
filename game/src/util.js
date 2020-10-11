
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
            var offset = 0;
            if (data.keyFrameOffset) {
                offset = data.keyFrameOffset;
            }
            
            for (var keyFrame of data.keyFrames) {
                if (keyFrame.len > 1) {
                    var frames = phaser.anims.generateFrameNumbers(data.id, 
                            { start:  keyFrame.start + offset, end: keyFrame.start + offset + keyFrame.len - 1 });
                    if (keyFrame.reversed) {
                        frames.reverse();
                    }
                    phaser.anims.create({
                        key: data.id + ":" + keyFrame.key,
                        frames: frames,
                        frameRate: keyFrame.rate,
                        repeat: keyFrame.repeat,
                        yoyo: keyFrame.yoyo,
                    });
                }
                else {
                    phaser.anims.create({
                        key: data.id + ":" + keyFrame.key,
                        frames: [ { key: data.id, frame: keyFrame.start + offset } ],
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

    static withContext(callback, context)
    {
        return function (...args) { callback.call(context, ...args) };
    }

    static iOS() {
        return [
          'iPad Simulator',
          'iPhone Simulator',
          'iPod Simulator',
          'iPad',
          'iPhone',
          'iPod'
        ].includes(navigator.platform)
        // iPad on iOS 13 detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    }

    // https://stackoverflow.com/a/11381730
    static mobileCheck() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
      };

    // https://stackoverflow.com/a/9039885
    static iOS() {
        return [
          'iPad Simulator',
          'iPhone Simulator',
          'iPod Simulator',
          'iPad',
          'iPhone',
          'iPod'
        ].includes(navigator.platform)
        // iPad on iOS 13 detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
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