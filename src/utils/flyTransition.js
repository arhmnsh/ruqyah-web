// Vue <Transition :css="false"> hooks for a sheet/modal that eases in on open and, on close,
// shrinks and travels into a trigger button (a "genie" effect) so the exit itself shows the
// reader exactly where to reopen it. `getAnchorEl` returns the current button element (or null);
// `panelSelector`, if given, animates that inner element while the outer root (backdrop) just
// fades, since the root is usually a fixed full-screen overlay and the panel is the visible card.
export function useFlyTransition(getAnchorEl, panelSelector) {
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const panelOf = (el) => (panelSelector ? el.querySelector(panelSelector) : el);

  function onEnter(el, done) {
    const panel = panelOf(el);
    if (reducedMotion()) {
      done();
      return;
    }
    const animations = [el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease' })];
    if (panel && panel !== el) {
      animations.push(
        panel.animate(
          [
            { opacity: 0, transform: 'translateY(22px) scale(.96)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' },
        ),
      );
    }
    Promise.all(animations.map((a) => a.finished)).then(done, done);
  }

  function onLeave(el, done) {
    const panel = panelOf(el) || el;
    const anchor = getAnchorEl();
    if (reducedMotion() || !anchor) {
      const anim = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease' });
      anim.onfinish = done;
      return;
    }
    const panelRect = panel.getBoundingClientRect();
    const buttonRect = anchor.getBoundingClientRect();
    const dx = buttonRect.left + buttonRect.width / 2 - (panelRect.left + panelRect.width / 2);
    const dy = buttonRect.top + buttonRect.height / 2 - (panelRect.top + panelRect.height / 2);
    const scaleX = Math.max(buttonRect.width / panelRect.width, 0.03);
    const scaleY = Math.max(buttonRect.height / panelRect.height, 0.03);

    const backdrop = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: 'ease' });
    const flight = panel.animate(
      [
        { transform: 'translate(0, 0) scale(1, 1)', opacity: 1, offset: 0 },
        {
          transform: `translate(${dx * 0.55}px, ${dy * 0.55}px) scale(${1 - (1 - scaleX) * 0.6}, ${1 - (1 - scaleY) * 0.6})`,
          opacity: 0.85,
          offset: 0.55,
        },
        { transform: `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`, opacity: 0, offset: 1 },
      ],
      { duration: 380, easing: 'cubic-bezier(.4,0,.2,1)' },
    );
    Promise.all([backdrop.finished, flight.finished]).then(done, done);
  }

  return { onEnter, onLeave };
}
