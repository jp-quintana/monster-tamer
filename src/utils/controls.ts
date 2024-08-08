import { DIRECTION } from '../common/direction';

export class Controls {
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys & {
    esc: Phaser.Input.Keyboard.Key;
  };
  private lockPlayerInput: boolean;

  constructor(private scene: Phaser.Scene) {
    if (this.scene.input.keyboard) {
      this.cursorKeys = {
        esc: this.scene.input.keyboard.addKey(
          Phaser.Input.Keyboard.KeyCodes.ESC
        ),
        ...this.scene.input.keyboard.createCursorKeys(),
      };
    }

    this.lockPlayerInput = false;
  }

  get isInputLocked() {
    return this.lockPlayerInput;
  }

  set lockInput(val: boolean) {
    this.lockInput = val;
  }

  wasSpaceKeyPressed() {
    if (!this.cursorKeys) return false;
    return Phaser.Input.Keyboard.JustDown(this.cursorKeys.space);
  }

  wasEscKeyPressed() {
    if (!this.cursorKeys) return false;
    return Phaser.Input.Keyboard.JustDown(this.cursorKeys.esc);
  }

  getDirectionKeyJustPressed() {
    let selectedDirection: DIRECTION = DIRECTION.NONE;
    if (!this.cursorKeys) return selectedDirection;
    if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.left)) {
      selectedDirection = DIRECTION.LEFT;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.right)) {
      selectedDirection = DIRECTION.RIGHT;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.up)) {
      selectedDirection = DIRECTION.UP;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.down)) {
      selectedDirection = DIRECTION.DOWN;
    }
    return selectedDirection;
  }

  getDirectionKeyPressedDown() {
    let selectedDirection: DIRECTION = DIRECTION.NONE;
    if (!this.cursorKeys) return selectedDirection;
    if (this.cursorKeys.left.isDown) {
      selectedDirection = DIRECTION.LEFT;
    } else if (this.cursorKeys.right.isDown) {
      selectedDirection = DIRECTION.RIGHT;
    } else if (this.cursorKeys.up.isDown) {
      selectedDirection = DIRECTION.UP;
    } else if (this.cursorKeys.down.isDown) {
      selectedDirection = DIRECTION.DOWN;
    }
    return selectedDirection;
  }
}
