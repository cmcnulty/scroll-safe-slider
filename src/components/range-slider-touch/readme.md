# range-slider-touch

<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                  | Type       | Default     |
| ---------- | ---------- | -------------------------------------------- | ---------- | ----------- |
| `disabled` | `disabled` |                                              | `boolean`  | `undefined` |
| `max`      | `max`      |                                              | `number`   | `100`       |
| `min`      | `min`      |                                              | `number`   | `0`         |
| `step`     | `step`     | Specifies the value granularity.             | `number`   | `1`         |
| `ticks`    | --         | Tick mark values to display along the track. | `number[]` | `[]`        |
| `time`     | `time`     | Long press time in milliseconds.             | `number`   | `300`       |
| `value`    | `value`    |                                              | `number`   | `50`        |


## Events

| Event    | Description                              | Type                                  |
| -------- | ---------------------------------------- | ------------------------------------- |
| `change` | Emits value only on release and changed. | `CustomEvent<RangeSliderChangeEvent>` |
| `input`  | Emits value on move, press and release.  | `CustomEvent<RangeSliderChangeEvent>` |


## Shadow Parts

| Part      | Description |
| --------- | ----------- |
| `"back"`  |             |
| `"fill"`  |             |
| `"thumb"` |             |
| `"tick"`  |             |
| `"track"` |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
