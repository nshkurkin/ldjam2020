
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
                    phaser.anims.create({
                        key: data.id + ":" + keyFrame.key,
                        frames: phaser.anims.generateFrameNumbers(data.id, 
                                { start:  keyFrame.start, end: keyFrame.start + keyFrame.len - 1 }),
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