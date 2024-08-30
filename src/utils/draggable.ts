export function makeDraggable(gameObject, enableLogs = false) {
  gameObject.setInteractive();

  /**
   * @param {string} message
   * @returns {void}
   */
  function log(message) {
    if (enableLogs) {
      console.debug(message);
    }
  }

  /**
   * @param {Phaser.Input.Pointer} pointer
   * @returns {void}
   */
  function onDrag(pointer) {
    log(`[makeDraggable:onDrag] invoked for game object: ${gameObject.name}`);
    gameObject.x = pointer.x;
    gameObject.y = pointer.y;
  }

  /**
   * @returns {void}
   */
  function stopDrag() {
    log(`[makeDraggable:stopDrag] invoked for game object: ${gameObject.name}`);
    gameObject.on(Phaser.Input.Events.POINTER_DOWN, startDrag);
    gameObject.off(Phaser.Input.Events.POINTER_MOVE, onDrag);
    gameObject.off(Phaser.Input.Events.POINTER_UP, stopDrag);
    gameObject.x = Math.round(gameObject.x);
    gameObject.y = Math.round(gameObject.y);
  }

  /**
   * @returns {void}
   */
  function startDrag() {
    log(
      `[makeDraggable:startDrag] invoked for game object: ${gameObject.name}`
    );
    gameObject.off(Phaser.Input.Events.POINTER_DOWN, startDrag);
    gameObject.on(Phaser.Input.Events.POINTER_MOVE, onDrag);
    gameObject.on(Phaser.Input.Events.POINTER_UP, stopDrag);
  }

  /**
   * @returns {void}
   */
  function destroy() {
    log(`[makeDraggable:destroy] invoked for game object: ${gameObject.name}`);
    gameObject.off(Phaser.Input.Events.POINTER_DOWN, startDrag);
    gameObject.off(Phaser.Input.Events.POINTER_MOVE, onDrag);
    gameObject.off(Phaser.Input.Events.POINTER_UP, stopDrag);
  }

  gameObject.on(Phaser.Input.Events.POINTER_DOWN, startDrag);
  gameObject.once(Phaser.GameObjects.Events.DESTROY, destroy);
}
