import { UI_ASSET_KEYS } from '../assets/asset-keys';
import { KENNEY_FUTURE_NARROW_FONT_NAME } from '../assets/font-keys';
import { CANNOT_READ_SIGN_TEXT } from '../utils/text-utils';

const UI_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = Object.freeze({
  fontFamily: KENNEY_FUTURE_NARROW_FONT_NAME,
  color: 'black',
  fontSize: '32px',
  wordWrap: { width: 0 },
});

export class DialogUi {
  private padding: number;
  private height: number;
  private container: Phaser.GameObjects.Container;
  #isVisible: boolean;
  private userInputCursor: Phaser.GameObjects.Image;
  private userInputCursorTween: Phaser.Tweens.Tween;
  private uiText: Phaser.GameObjects.Text;
  #textAnimationPlaying: boolean;
  private messagesToShow: string[];

  constructor(private scene: Phaser.Scene, private width: number) {
    this.padding = 90;
    this.width -= this.padding * 2;
    this.height = 124;
    this.#textAnimationPlaying = false;
    this.messagesToShow = [];

    const panel = this.scene.add
      .rectangle(
        // this.padding,
        // this.scene.scale.height - this.height,
        0,
        0,
        this.width,
        this.height,
        0xede4f3,
        0.9
      )
      .setOrigin(0)
      .setStrokeStyle(8, 0x905ac2, 1);

    this.container = this.scene.add.container(0, 0, [panel]);
    this.uiText = this.scene.add.text(18, 12, CANNOT_READ_SIGN_TEXT, {
      ...UI_TEXT_STYLE,
      ...{ wordWrap: { width: this.width - 18 } },
    });
    this.container.add(this.uiText);
    this.createPlayerInputCursor();
    this.hideDialogModal();
  }

  get isVisible() {
    return this.#isVisible;
  }

  showDialogModal() {
    const { x, bottom } = this.scene.cameras.main.worldView;

    const startX = x + this.padding;
    const startY = bottom - this.height - this.padding / 4;

    this.container.setPosition(startX, startY);
    this.userInputCursorTween.restart();
    this.container.setAlpha(1);
    this.#isVisible = true;
  }

  hideDialogModal() {
    this.container.setAlpha(0);
    this.userInputCursorTween.pause();
    this.#isVisible = false;
  }

  private createPlayerInputCursor() {
    const y = this.height - 24;
    this.userInputCursor = this.scene.add.image(
      this.width - 16,
      y,
      UI_ASSET_KEYS.CURSOR
    );
    this.userInputCursor.setAngle(90).setScale(4.5, 2);

    this.userInputCursorTween = this.scene.add.tween({
      delay: 0,
      duration: 500,
      repeat: -1,
      y: {
        from: y,
        start: y,
        to: y + 6,
      },
      targets: this.userInputCursor,
    });
    this.userInputCursorTween.pause();
    this.container.add(this.userInputCursor);
  }
}
