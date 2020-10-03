
class Util {
    static degToRad (degrees) {
        return degrees * Math.PI / 180.0;
    }
}

function MakeVec2(x, y) {
    return new Phaser.Math.Vector2(x, y);
}
