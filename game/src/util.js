
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
                        key: keyFrame.key,
                        frames: phaser.anims.generateFrameNumbers(data.id, 
                                { start:  keyFrame.start, end: keyFrame.start + keyFrame.len - 1 }),
                        frameRate: keyFrame.rate,
                        repeat: keyFrame.repeat
                    });
                }
                else {
                    phaser.anims.create({
                        key: keyFrame.key,
                        frames: [ { key: data.id, frame: keyFrame.start } ],
                        frameRate: keyFrame.rate
                    });
                }
            }
        }
    
        return data;
    }
}

function MakeVec2(x, y) {
    return new Phaser.Math.Vector2(x, y);
}

