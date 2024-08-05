export const animateText = (
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Text,
  text: string,
  config: { delay?: number; callback?: () => void }
) => {
  const length = text.length;
  let i = 0;

  scene.time.addEvent({
    callback: () => {
      target.text += text[i];
      i++;
      if (i === length - 1 && config?.callback) config.callback();
    },
    repeat: length - 1,
    delay: config?.delay || 25,
  });
};
