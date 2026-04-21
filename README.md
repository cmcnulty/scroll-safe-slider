# scroll-safe-slider

[![Version][version]][package]

A range slider web component built for touch. Detects scroll intent using touch angle — vertical swipes scroll the page, horizontal swipes activate the slider — so sliders stacked in a scrollable container work naturally without accidental value changes.

## Features

- **Angle-based scroll detection** — vertical swipes pass through to native scroll instantly; horizontal swipes activate the slider immediately
- **Long-press fallback** — holding activates the slider when no directional movement is detected
- **Keyboard navigation** — Arrow keys, Page Up/Down, Home/End mirror native `<input type="range">` behavior
- **Flexible styling** — CSS custom properties for track height, thumb size, and more; shadow parts for full control
- **Tick marks** — pass an array of values to render MD-style two-color tick marks
- Responsive, shadow DOM, zero dependencies

## Installation

```bash
npm i scroll-safe-slider
```

```ts
import 'scroll-safe-slider';
```

## Usage

```html
<scroll-safe-slider min="0" max="100" value="50" step="1"></scroll-safe-slider>
```

## Properties

| Property | Attribute | Description | Type | Default |
| --- | --- | --- | --- | --- |
| `value` | `value` | Current value | `number` | `50` |
| `min` | `min` | Minimum value | `number` | `0` |
| `max` | `max` | Maximum value | `number` | `100` |
| `step` | `step` | Value granularity | `number` | `1` |
| `time` | `time` | Long-press activation time (ms) | `number` | `300` |
| `ticks` | — | Tick mark values (set via JS) | `number[]` | `[]` |
| `disabled` | `disabled` | Disables the slider | `boolean` | `undefined` |

## Events

| Event | Description | Type |
| --- | --- | --- |
| `input` | Fires on every value change during interaction | `CustomEvent<{ value: number }>` |
| `change` | Fires on release, only if value changed | `CustomEvent<{ value: number }>` |

## Styling

The component inherits `color` for its fill color. Available CSS custom properties:

| Property | Default | Description |
| --- | --- | --- |
| `--track-height` | `4px` | Track height at rest |
| `--active-track-height` | `20px` | Track height when active |
| `--thumb-size` | `20px` | Thumb diameter |
| `--border-radius` | `10px` | Track border radius |
| `--background-opacity` | `0.15` | Unfilled track opacity |
| `--tick-size` | `4px` | Tick mark diameter |
| `--tick-active-color` | `#fff` | Tick color on the filled region |

```css
scroll-safe-slider {
  color: #1f80ff;
  --track-height: 4px;
  --active-track-height: 6px;
  --thumb-size: 22px;
}
```

## Shadow Parts

| Part | Description |
| --- | --- |
| `thumb` | The draggable handle |
| `track` | The full track container |
| `fill` | The filled (active) portion |
| `back` | The unfilled background portion |
| `tick` | Individual tick mark elements |

```css
scroll-safe-slider::part(thumb) {
  display: none;
}
```

## Tick Marks

Ticks must be set programmatically:

```js
const slider = document.querySelector('scroll-safe-slider');
slider.ticks = Array.from({ length: 11 }, (_, i) => i * 10); // every 10 units
```

## Angular

```ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { defineCustomElements } from 'scroll-safe-slider/loader';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

defineCustomElements();
```

<!-- Links -->

[version]: https://img.shields.io/npm/v/scroll-safe-slider.svg?style=flat-square
[package]: https://www.npmjs.com/package/scroll-safe-slider
