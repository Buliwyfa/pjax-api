import { Supervisor } from 'spica';
import { bind } from '../../../../lib/dom';

export class ScrollView {
  constructor(
    window: Window,
    listener: (event: Event) => any
  ) {
    let timer = 0;
    void this.sv.register('', () => (
      new Promise<never>(() =>
        void this.sv.events.exit.once(
          [],
          bind(window, 'scroll', ev => (
            timer = timer > 0
              ? timer
              : setTimeout(() => {
                  timer = 0;
                  void listener(ev);
                }, 300)
          ), { passive: true })))
    ), void 0);
    void this.sv.cast('', void 0);
  }
  private readonly sv = new class extends Supervisor<'', void, void, void>{ }();
  public readonly close = (): void =>
    void this.sv.terminate();
}
