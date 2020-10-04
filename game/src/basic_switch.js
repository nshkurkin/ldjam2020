class BasicSwitch {

    constructor(
        /* FxObject */ fxData = null, 
        /* Phaser.Math.Vector2 */ pos = null)
    {
        if (pos == null) {
            pos = MakeVec2(0, 0);
        }
        if (fxData == null) {
            fxData = g.fx.data.basic_switch;
        }
        
        this.fxData = fxData;
        this.gameObj = g.engine.physics.add.sprite(pos.x, pos.y, fxData.id).setScale(g.scale);
        this.setActive(false);
    }

    setActive(active)
    {
        if (active) {
            this.gameObj.anims.play(this.fxData.id + ':' + 'active', true);
        }
        else {
            this.gameObj.anims.play(this.fxData.id + ':' + 'inactive', true);
        }
    }

    update(time, delta)
    {
        // TODO
    }

    destroy()
    {
        // TODO
    }
}