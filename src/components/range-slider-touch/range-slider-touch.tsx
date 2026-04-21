import { Component, Element, Event, EventEmitter, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { clamp } from '../../utils/utils';

export interface RangeSliderChangeEvent {
  value: number;
}

@Component({
  tag: 'range-slider-touch',
  styleUrl: 'range-slider-touch.scss',
  shadow: true,
})
export class RangeSliderTouchComponent {
  @Prop({ mutable: true }) value = 50;

  @Prop() min = 0;
  @Prop() max = 100;

  /** Specifies the value granularity. */
  @Prop() step = 1;

  /** Long press time in milliseconds. */
  @Prop() time = 300;

  @Prop() disabled?: boolean;

  @Watch('min')
  @Watch('max')
  protected rangeChanged(): void {
    this.clampValue();
  }

  /** Emits value on move, press and release. */
  @Event() input!: EventEmitter<RangeSliderChangeEvent>;
  /** Emits value only on release and changed. */
  @Event() change!: EventEmitter<RangeSliderChangeEvent>;

  @Element() el: HTMLElement;

  @State() percent = 0;
  @State() active = false;
  @State() touch = false;
  @State() pressing = false;
  @State() ready = false;

  /** Used for change detection. */
  private _value?: number;
  private _valueInput?: number;

  elSlider!: HTMLElement;

  connectedCallback() {
    this.clampValue();
    this.toPercent();
  }

  toPercent() {
    this.percent = ((this.value - this.min) / (this.max - this.min)) * 100;
    this.percent = clamp(this.percent, 0, 100);
  }

  clampValue() {
    this.value = clamp(this.value, this.min, this.max);
  }

  sliderMove(rect: DOMRect, event: MouseEvent | TouchEvent, released = false) {
    // Firefox quirk: TouchEvent is not defined globally. We cannot use instanceof.
    const input = 'changedTouches' in event ? event.changedTouches[0] : event;

    this.percent = ((input.clientX - rect.x) * 100) / rect.width;
    this.percent = clamp(this.percent, 0, 100);

    this.value = this.min + (this.percent / 100) * (this.max - this.min);

    if (this.step) {
      const snap = this.percent < 25 ? Math.floor : this.percent > 75 ? Math.ceil : Math.round;
      this.value = snap((this.value - this.min) / this.step) * this.step + this.min;
    }

    this.clampValue();
    this.toPercent();

    if (this.value !== this._valueInput) {
      this.input.emit({ value: this.value });
      this._valueInput = this.value;
    }

    if (released) {
      if (this.value !== this._value) {
        this.change.emit({ value: this.value });
        this._value = this.value;
      }
    }
  }

  @Listen('mousedown')
  onMouseDown(event: MouseEvent) {
    if (this.disabled) {
      return;
    }

    this.touch = false;
    const rect = this.elSlider.getBoundingClientRect();
    const moveFn = (event: MouseEvent) => {
      this.active = true;
      this.sliderMove(rect, event);
    };

    this.sliderMove(rect, event);
    window.addEventListener('mousemove', moveFn);

    const onMouseUp = (event: MouseEvent) => {
      window.removeEventListener('mousemove', moveFn);
      this.sliderMove(rect, event, true);
      this.active = false;
    };

    window.addEventListener('mouseup', onMouseUp, { once: true });
  }

  @Listen('touchstart')
  onTouchStart(event: TouchEvent) {
    if (this.disabled) {
      return;
    }

    this.touch = true;
    this.pressing = true;

    const startX = event.touches[0].clientX;
    const startY = event.touches[0].clientY;
    let canceled = false;
    let activated = false;

    const rect = this.elSlider.getBoundingClientRect();
    const moveFn = this.sliderMove.bind(this, rect);

    const activate = (e: TouchEvent) => {
      window.removeEventListener('touchmove', trackMove);
      activated = true;
      this.pressing = false;
      this.ready = true;
      setTimeout(() => { this.ready = false; }, 300);
      this.sliderMove(rect, e);
      window.addEventListener('touchmove', moveFn);

      const onTouchEnd = (e: TouchEvent) => {
        window.removeEventListener('touchmove', moveFn);
        this.sliderMove(rect, e, true);
        this.active = false;
      };

      window.addEventListener('touchend', onTouchEnd, { once: true });
      this.active = true;
    };

    const trackMove = (e: TouchEvent) => {
      const deltaX = Math.abs(e.touches[0].clientX - startX);
      const deltaY = Math.abs(e.touches[0].clientY - startY);
      if (deltaX > 0 || deltaY > 0) {
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        if (angle > 20) {
          clearTimeout(activationTimer);
          window.removeEventListener('touchmove', trackMove);
          canceled = true;
          this.pressing = false;
        } else {
          clearTimeout(activationTimer);
          activate(e);
        }
      }
    };
    window.addEventListener('touchmove', trackMove);

    const activationTimer = setTimeout(() => activate(event), this.time);

    window.addEventListener(
      'touchend',
      (e) => {
        clearTimeout(activationTimer);
        window.removeEventListener('touchmove', trackMove);
        this.pressing = false;
        if (!canceled && !activated) {
          this.sliderMove(rect, e, true);
        }
      },
      { once: true },
    );
  }

  render() {
    const expanded = this.touch && (this.active || this.pressing);
    const scaleY = expanded ? 1 : 0.2;
    const thumbScale = expanded ? 0 : 1;
    const pos = this.percent - 100;
    const pressDelay = 80;
    const pressTransition = this.pressing ? `transform ${this.time - pressDelay}ms linear ${pressDelay}ms` : undefined;

    return (
      <Host class={{ active: this.active, touch: this.touch, disabled: this.disabled }}>
        <div class='slider' ref={(el) => (this.elSlider = el as HTMLInputElement)}>
          <div class={{ range: true, ready: this.ready }}>
            <div class='track' style={{ transform: `scaleY(${scaleY})`, transition: pressTransition }}>
              <div class='back'></div>
              <div class='fore' style={{ transform: `translateX(${pos}%)` }}></div>
            </div>
          </div>

          <div class='thumb' style={{ transform: `translateX(${pos}%)`, transition: pressTransition }}>
            <div class='handle' part='thumb' style={{ transform: `scale(${thumbScale})`, transition: pressTransition }}></div>
          </div>
        </div>
      </Host>
    );
  }
}
