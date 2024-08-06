import * as WebFontLoader from '../lib/webfontloader.ts';

export class WebFontFileLoader extends Phaser.Loader.File {
  private fontNames: string[];
  constructor(loader: Phaser.Loader.LoaderPlugin, fontNames: string[]) {
    super(loader, {
      type: 'webfont',
      key: fontNames.toString(),
    });

    this.fontNames = fontNames;
  }

  load() {
    WebFontLoader.default.load({
      custom: { families: this.fontNames },
      active: () => {
        console.log('fonts loaded');
        this.loader.nextFile(this, true);
      },
      inactive: () => {
        console.error(
          `Failed to load custom fonts ${JSON.stringify(this.fontNames)}`
        );
        this.loader.nextFile(this, false);
      },
    });
  }
}
