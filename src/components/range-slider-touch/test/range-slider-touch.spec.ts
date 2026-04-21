import { newSpecPage } from '@stencil/core/testing';
import { RangeSliderTouchComponent } from '../range-slider-touch';

// jsdom does not implement TouchEvent — polyfill for test environment
class MockTouchEvent extends Event {
  touches: any[];
  changedTouches: any[];
  constructor(type: string, init: any = {}) {
    super(type, { bubbles: true, cancelable: true, ...init });
    this.touches = init.touches || [];
    this.changedTouches = init.changedTouches || [];
  }
}
(global as any).TouchEvent = MockTouchEvent;

async function newSliderPage(html: string) {
  return newSpecPage({ components: [RangeSliderTouchComponent], html });
}

// ─── Rendering ───────────────────────────────────────────────────────────────

describe('rendering', () => {
  it('renders default state', async () => {
    const { root } = await newSliderPage('<scroll-safe-slider></scroll-safe-slider>');
    expect(root).toEqualHtml(`
      <scroll-safe-slider aria-valuemax="100" aria-valuemin="0" aria-valuenow="50" role="slider" tabindex="0">
        <mock:shadow-root>
          <div class="slider">
            <div class="range">
              <div class="track" part="track">
                <div class="back" part="back"></div>
                <div class="fore" part="fill" style="transform: translateX(-50%);"></div>
              </div>
            </div>
            <div class="thumb" style="transform: translateX(-50%);">
              <div class="handle" part="thumb" style="transform: scale(1);"></div>
            </div>
          </div>
        </mock:shadow-root>
      </scroll-safe-slider>
    `);
  });

  it('renders with value', async () => {
    const { root } = await newSliderPage('<scroll-safe-slider value="75"></scroll-safe-slider>');
    const fore = root.shadowRoot.querySelector('.fore') as HTMLElement;
    expect(fore.style.transform).toBe('translateX(-25%)');
    const thumb = root.shadowRoot.querySelector('.thumb') as HTMLElement;
    expect(thumb.style.transform).toBe('translateX(-25%)');
  });

  it('renders at min', async () => {
    const { root } = await newSliderPage('<scroll-safe-slider value="0"></scroll-safe-slider>');
    const fore = root.shadowRoot.querySelector('.fore') as HTMLElement;
    expect(fore.style.transform).toBe('translateX(-100%)');
  });

  it('renders at max', async () => {
    const { root } = await newSliderPage('<scroll-safe-slider value="100"></scroll-safe-slider>');
    const fore = root.shadowRoot.querySelector('.fore') as HTMLElement;
    expect(fore.style.transform).toBe('translateX(0%)');
  });

  it('clamps value above max', async () => {
    const { root } = await newSliderPage('<scroll-safe-slider value="200" max="100"></scroll-safe-slider>');
    expect(root.getAttribute('aria-valuenow')).toBe('100');
  });

  it('clamps value below min', async () => {
    const { root } = await newSliderPage('<scroll-safe-slider value="-10" min="0"></scroll-safe-slider>');
    expect(root.getAttribute('aria-valuenow')).toBe('0');
  });

  it('renders disabled state', async () => {
    const { root } = await newSliderPage('<scroll-safe-slider disabled></scroll-safe-slider>');
    expect(root).toHaveClass('disabled');
    expect(root.getAttribute('tabindex')).toBe('-1');
    // Stencil renders boolean true as either "true" or "" depending on env
    expect(['true', '']).toContain(root.getAttribute('aria-disabled'));
  });
});

// ─── ARIA ─────────────────────────────────────────────────────────────────────

describe('accessibility', () => {
  it('sets role slider', async () => {
    const { root } = await newSliderPage('<scroll-safe-slider></scroll-safe-slider>');
    expect(root.getAttribute('role')).toBe('slider');
  });

  it('reflects min/max/value in aria attributes', async () => {
    const { root } = await newSliderPage('<scroll-safe-slider min="10" max="90" value="50"></scroll-safe-slider>');
    expect(root.getAttribute('aria-valuemin')).toBe('10');
    expect(root.getAttribute('aria-valuemax')).toBe('90');
    expect(root.getAttribute('aria-valuenow')).toBe('50');
  });

  it('is focusable when enabled', async () => {
    const { root } = await newSliderPage('<scroll-safe-slider></scroll-safe-slider>');
    expect(root.getAttribute('tabindex')).toBe('0');
  });

  it('is not focusable when disabled', async () => {
    const { root } = await newSliderPage('<scroll-safe-slider disabled></scroll-safe-slider>');
    expect(root.getAttribute('tabindex')).toBe('-1');
  });
});

// ─── Keyboard ─────────────────────────────────────────────────────────────────

describe('keyboard navigation', () => {
  async function pressKey(root: HTMLElement, key: string) {
    root.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    await new Promise(r => setTimeout(r, 0));
  }

  it('ArrowRight increases value by step', async () => {
    const { root, waitForChanges } = await newSliderPage('<scroll-safe-slider value="50" step="5"></scroll-safe-slider>');
    await pressKey(root, 'ArrowRight');
    await waitForChanges();
    expect(root.getAttribute('aria-valuenow')).toBe('55');
  });

  it('ArrowLeft decreases value by step', async () => {
    const { root, waitForChanges } = await newSliderPage('<scroll-safe-slider value="50" step="5"></scroll-safe-slider>');
    await pressKey(root, 'ArrowLeft');
    await waitForChanges();
    expect(root.getAttribute('aria-valuenow')).toBe('45');
  });

  it('ArrowUp increases value by step', async () => {
    const { root, waitForChanges } = await newSliderPage('<scroll-safe-slider value="50" step="1"></scroll-safe-slider>');
    await pressKey(root, 'ArrowUp');
    await waitForChanges();
    expect(root.getAttribute('aria-valuenow')).toBe('51');
  });

  it('ArrowDown decreases value by step', async () => {
    const { root, waitForChanges } = await newSliderPage('<scroll-safe-slider value="50" step="1"></scroll-safe-slider>');
    await pressKey(root, 'ArrowDown');
    await waitForChanges();
    expect(root.getAttribute('aria-valuenow')).toBe('49');
  });

  it('PageUp increases by 10% of range', async () => {
    const { root, waitForChanges } = await newSliderPage('<scroll-safe-slider value="50" min="0" max="100"></scroll-safe-slider>');
    await pressKey(root, 'PageUp');
    await waitForChanges();
    expect(root.getAttribute('aria-valuenow')).toBe('60');
  });

  it('PageDown decreases by 10% of range', async () => {
    const { root, waitForChanges } = await newSliderPage('<scroll-safe-slider value="50" min="0" max="100"></scroll-safe-slider>');
    await pressKey(root, 'PageDown');
    await waitForChanges();
    expect(root.getAttribute('aria-valuenow')).toBe('40');
  });

  it('Home sets value to min', async () => {
    const { root, waitForChanges } = await newSliderPage('<scroll-safe-slider value="50" min="10" max="100"></scroll-safe-slider>');
    await pressKey(root, 'Home');
    await waitForChanges();
    expect(root.getAttribute('aria-valuenow')).toBe('10');
  });

  it('End sets value to max', async () => {
    const { root, waitForChanges } = await newSliderPage('<scroll-safe-slider value="50" min="0" max="90"></scroll-safe-slider>');
    await pressKey(root, 'End');
    await waitForChanges();
    expect(root.getAttribute('aria-valuenow')).toBe('90');
  });

  it('does not exceed max', async () => {
    const { root, waitForChanges } = await newSliderPage('<scroll-safe-slider value="100" max="100"></scroll-safe-slider>');
    await pressKey(root, 'ArrowRight');
    await waitForChanges();
    expect(root.getAttribute('aria-valuenow')).toBe('100');
  });

  it('does not go below min', async () => {
    const { root, waitForChanges } = await newSliderPage('<scroll-safe-slider value="0" min="0"></scroll-safe-slider>');
    await pressKey(root, 'ArrowLeft');
    await waitForChanges();
    expect(root.getAttribute('aria-valuenow')).toBe('0');
  });

  it('does nothing when disabled', async () => {
    const { root, waitForChanges } = await newSliderPage('<scroll-safe-slider value="50" disabled></scroll-safe-slider>');
    await pressKey(root, 'ArrowRight');
    await waitForChanges();
    expect(root.getAttribute('aria-valuenow')).toBe('50');
  });

  it('emits input and change events on keypress', async () => {
    const { root, waitForChanges } = await newSliderPage('<scroll-safe-slider value="50"></scroll-safe-slider>');
    const inputSpy = jest.fn();
    const changeSpy = jest.fn();
    root.addEventListener('sliderInput', inputSpy);
    root.addEventListener('sliderChange', changeSpy);
    await pressKey(root, 'ArrowRight');
    await waitForChanges();
    expect(inputSpy).toHaveBeenCalledTimes(1);
    expect(changeSpy).toHaveBeenCalledTimes(1);
    expect(inputSpy.mock.calls[0][0].detail).toEqual({ value: 51 });
  });
});

// ─── Tick marks ───────────────────────────────────────────────────────────────

describe('tick marks', () => {
  it('renders no ticks by default', async () => {
    const { root } = await newSliderPage('<scroll-safe-slider></scroll-safe-slider>');
    expect(root.shadowRoot.querySelectorAll('.tick')).toHaveLength(0);
  });

  it('renders correct number of ticks', async () => {
    const { root, rootInstance, waitForChanges } = await newSliderPage('<scroll-safe-slider></scroll-safe-slider>');
    rootInstance.ticks = [0, 25, 50, 75, 100];
    await waitForChanges();
    // Two sets: one in .back, one in .fore
    expect(root.shadowRoot.querySelectorAll('.tick')).toHaveLength(10);
  });

  it('positions back ticks at correct percentages', async () => {
    const { root, rootInstance, waitForChanges } = await newSliderPage('<scroll-safe-slider value="50" min="0" max="100"></scroll-safe-slider>');
    rootInstance.ticks = [0, 50, 100];
    await waitForChanges();
    const backTicks = Array.from(root.shadowRoot.querySelectorAll('.back .tick')) as HTMLElement[];
    expect(backTicks[0].style.left).toBe('0%');
    expect(backTicks[1].style.left).toBe('50%');
    expect(backTicks[2].style.left).toBe('100%');
  });

  it('positions fore ticks adjusted for current translateX', async () => {
    const { root, rootInstance, waitForChanges } = await newSliderPage('<scroll-safe-slider value="50" min="0" max="100"></scroll-safe-slider>');
    rootInstance.ticks = [25];
    await waitForChanges();
    // pos = percent - 100 = 50 - 100 = -50
    // fore tick left = tickPercent - pos = 25 - (-50) = 75%
    const foreTick = root.shadowRoot.querySelector('.fore .tick') as HTMLElement;
    expect(foreTick.style.left).toBe('75%');
  });
});

// ─── Touch angle detection ────────────────────────────────────────────────────

describe('touch angle detection', () => {
  afterEach(() => {
    // Cancel any pending activationTimer left open by touchstart
    window.dispatchEvent(new (global as any).TouchEvent('touchend', {
      changedTouches: [{ clientX: 0, clientY: 0, identifier: 0 }],
    }));
  });

  function touch(clientX: number, clientY: number) {
    return [{ clientX, clientY, identifier: 0 }];
  }

  function fireTouchStart(target: EventTarget, clientX: number, clientY: number) {
    target.dispatchEvent(new (global as any).TouchEvent('touchstart', {
      touches: touch(clientX, clientY),
      changedTouches: touch(clientX, clientY),
    }));
  }

  function fireTouchMove(clientX: number, clientY: number) {
    window.dispatchEvent(new (global as any).TouchEvent('touchmove', {
      touches: touch(clientX, clientY),
      changedTouches: touch(clientX, clientY),
    }));
  }

  it('sets pressing true on touchstart', async () => {
    const { root, rootInstance, waitForChanges } = await newSliderPage('<scroll-safe-slider></scroll-safe-slider>');
    fireTouchStart(root, 50, 0);
    await waitForChanges();
    expect(rootInstance.pressing).toBe(true);
  });

  it('cancels on vertical swipe (angle > 20°)', async () => {
    const { root, rootInstance, waitForChanges } = await newSliderPage('<scroll-safe-slider></scroll-safe-slider>');
    fireTouchStart(root, 50, 0);
    await waitForChanges();
    // Vertical move: deltaX=2, deltaY=20 → angle ≈ 84°
    fireTouchMove(52, 20);
    await waitForChanges();
    expect(rootInstance.pressing).toBe(false);
    expect(rootInstance.active).toBe(false);
  });

  it('activates on horizontal swipe (angle ≤ 20°)', async () => {
    const { root, rootInstance, waitForChanges } = await newSliderPage('<scroll-safe-slider></scroll-safe-slider>');
    fireTouchStart(root, 50, 0);
    await waitForChanges();
    // Horizontal move: deltaX=20, deltaY=2 → angle ≈ 6°
    fireTouchMove(70, 2);
    await waitForChanges();
    expect(rootInstance.pressing).toBe(false);
    expect(rootInstance.active).toBe(true);
  });
});
