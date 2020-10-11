
class GameEntity {
    constructor() 
    {
        this.gameObj = null;

        g.entities.push(this);
    }

    update(time, delta)
    {
        this.updateVisibility();
    }

    updateVisibility()
    {
        if (!this.gameObj) {
            return;
        }

        let worldView = g.engine.cameras.main.worldView;
        var newVisible = true;
        if (this.gameObj.x < worldView.x || this.gameObj.x > worldView.x + worldView.width ||
            this.gameObj.y < worldView.y || this.gameObj.y > worldView.y + worldView.height) 
        {
            newVisible = false;
        }

        if (this.gameObj.visible != newVisible) {
            // Make the object invisible to turn off updates / visible to turn on updates.
            this.gameObj.visible = newVisible;

            // Pause / restart animations as the entity transitions between visible / invisible.
            if (!newVisible) {
                this.gameObj.anims.pause();
            }
            else if (this.gameObj.anims.currentAnim != null) {
                this.gameObj.anims.restart();
            }
        }
    }

    destroy()
    {
        g.entities.splice(g.entities.indexOf(this), 1);
        
        if (this.gameObj) {
            this.gameObj.destroy();
        }
    }
}

