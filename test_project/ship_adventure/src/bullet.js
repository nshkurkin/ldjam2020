class Bullet {
    // maybe this needs a static finish load but probs not
  constructor(x, y, direction, bulletData) {
    // The player and its settings
    this.gameObj = this.physics.add.sprite(x, y, bulletData.id).setScale(window.gScale);
    this.gameObj.angle = direction
    var vx = Math.cos(Util.degToRad(direction))
    var vy = Mtah.sin(Util.degToRad(direction))
    this.gameObj.setVelocity(vx, vy)
    window.entities.push(this)
  }
  
  update() {
    // todo decide when to destroy?
  }

  destroy() {

  }
}

