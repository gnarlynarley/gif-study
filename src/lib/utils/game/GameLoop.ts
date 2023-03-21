import noop from "../noop";

type UpdateMethod = (delta: number) => void;

interface GameLoopOptions {
  update?: UpdateMethod;
  render?: () => void;
}

export default class GameLoop {
  fps = 10;
  update: UpdateMethod;
  render: () => void;
  rafId: number | null = null;

  constructor({ render, update }: GameLoopOptions) {
    this.update = update ?? noop;
    this.render = render ?? noop;
  }

  play = () => {
    const { update, render, fps } = this;
    const delta = 1000 / fps;
    let lastTime = performance.now();
    let accumulator = 0;

    const frame = (currentTime: number) => {
      this.rafId = requestAnimationFrame(frame);

      if (accumulator > 10000) {
        accumulator = 0;
        return;
      }

      const ellapsed = currentTime - lastTime;
      lastTime = currentTime;
      accumulator += ellapsed;

      while (accumulator > delta) {
        accumulator -= delta;
        update(delta);
      }

      render();
    };

    this.rafId = requestAnimationFrame(frame);
  };

  stop = () => {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
  };
}
