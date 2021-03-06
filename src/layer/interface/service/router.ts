import { Cancelable, Supervisor } from 'spica';
import { Config, route as route_ } from '../../application/api';
import { canonicalizeUrl, CanonicalUrl } from '../../data/model/canonicalization/url';
import { validateUrl } from '../../data/model/validation/url';
import { documentUrl } from './state/url';
import { progressbar } from './progressbar';
import { InterfaceError } from '../data/error';

export function route(
  config: Config,
  event: Event,
  state: {
    router: Supervisor<'', Error, void, void>;
    scripts: Set<CanonicalUrl>;
    cancelable: Cancelable<Error>;
  },
  io: {
    document: Document;
  }
): Promise<void> {
  void state.router.cast('', new InterfaceError(`Abort.`));
  void state.router.register('', e => {
    throw void state.cancelable.cancel(e);
  }, void 0);
  void progressbar(config.progressbar);
  return route_(config, event, state, io)
    .then(m => (
      void state.router.terminate(''),
      void m
        .bind(state.cancelable.either)
        .fmap(ss => (
          void ss.forEach(s => void state.scripts.add(canonicalizeUrl(validateUrl(s.src)))),
          void documentUrl.sync()))
        .extract()))
    .catch(e => (
      void state.router.terminate(''),
      void state.cancelable.maybe(void 0)
        .extract(
          () => void 0,
          () => (
            void console.error(e),
            void Promise.reject(config.fallback(<HTMLAnchorElement>event._currentTarget, e))))));
}
