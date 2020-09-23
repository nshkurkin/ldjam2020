class Bullet {
  // maybe this needs a static finish load but probs not
  // [x, y] in screen pixels. `direction` is degrees. `speed` in pixels/second. `bulletData` is loaded JSON object.
  constructor(x, y, direction, speed, bulletData) {
    // The player and its settings
    this.gameObj = engine.physics.add.sprite(x, y, bulletData.id).setScale(window.gScale);
    this.gameObj.angle = direction
    var vx = speed * Math.cos(Util.degToRad(direction))
    var vy = speed * Math.sin(Util.degToRad(direction))
    this.gameObj.setVelocity(vx, vy)
    this.gameObj.anims.play('spiral', true)
    window.entities.push(this)
  }
  
  update() {
    // todo decide when to destroy?
  }

  destroy() {

  }
}

