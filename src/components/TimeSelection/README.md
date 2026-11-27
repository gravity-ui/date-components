<!--GITHUB_BLOCK-->

# TimeSelection

<!--/GITHUB_BLOCK-->

`TimeSelection` lets a user pick a time from columns of options: hours, minutes, seconds, milliseconds and, on the 12-hour clock, AM/PM. It has no input of its own, so it fits into a popup next to a calendar or a time field. It can be controlled if you set the `value` property. Or it can be uncontrolled if you don't set any value, but in this case you can manage the initial state with the optional property `defaultValue`. The component is uncontrolled by default.

> [!WARNING]
> `TimeSelection` is unstable: its API may change in a minor release. It is exported from the `unstable` entry point, not from the package root.

```tsx
import {TimeSelection} from '@gravity-ui/date-components/unstable';
```

## Useful addition

To set dates in the right format you may need to include additional helpers from [Date Utils library](https://gravity-ui.com/libraries/date-utils)

```tsx
import {dateTimeParse} from '@gravity-ui/date-utils';
```

## Value

Picking an option changes only its unit: the date and the other units stay as they are. The value is a `DateTime`, so it always carries a date.

While there is no value, nothing is selected, and the first pick is applied to `placeholderValue`. It defaults to today at midnight, so picking `14` in the hours column gives today, 14:00:00. If the first pick lands out of `minValue` and `maxValue` with the units of the placeholder, they are taken from the bound instead, the date included.

```tsx
<TimeSelection defaultValue={dateTimeParse('2024-01-15T10:30:00')} />
```

```tsx
const [value, setValue] = React.useState<DateTime | null>(null);

<TimeSelection value={value} onUpdate={setValue} />;
```

### Min and max value

The `minValue` property allows you to specify the earliest date and time that can be picked by the user. Conversely, the `maxValue` property specifies the latest date and time that can be picked. An option is unavailable when its whole interval — the hour, the minute, the second or the millisecond — is out of the range. A picked value that lands out of the range is moved to the nearest bound: with `minValue` at 10:20, picking the hour `10` at 12:10 gives 10:20.

```tsx
<TimeSelection
  minValue={dateTimeParse('2024-01-15T09:15:00')}
  maxValue={dateTimeParse('2024-01-15T18:45:00')}
/>
```

### Unavailable time

`isTimeUnavailable` is called for each option with the current value where the unit of the option is put in (before it is kept within `minValue` and `maxValue`) and the view of its column. If it returns `true`, the option is unavailable. An AM/PM option changes the hour, so it is checked with the `hours` view.

The options are counted again whenever the reference of the callback, `value`, `minValue`, `maxValue` or `placeholderValue` changes, so keep those references stable between renders (`React.useCallback`, `React.useMemo` or values outside the component).

```tsx
<TimeSelection isTimeUnavailable={(date, view) => view === 'hours' && date.hour() === 13} />
```

### Hiding unavailable options

By default the unavailable options stay in the columns and are shown as disabled. With `skipUnavailable` they are left out. Together with `isTimeUnavailable` it gives a column any set of options. A value whose unit is not in the set is still valid: the column just has nothing selected.

```tsx
const MINUTES = [0, 10, 25, 40];
const isTimeUnavailable = (date: DateTime, view: TimeSelectionView) =>
  view === 'minutes' && !MINUTES.includes(date.minute());

<TimeSelection isTimeUnavailable={isTimeUnavailable} skipUnavailable />;
```

## Views

`views` sets the units to show columns for; any subset is allowed. The columns always go in the same order: hours, minutes, seconds, milliseconds. The default is `['hours', 'minutes']`.

```tsx
<TimeSelection views={['hours', 'minutes', 'seconds']} />
```

### Milliseconds

The `milliseconds` view adds a column of three-digit options, `000 … 999`. With the default step that is a thousand options, so consider a step for it.

```tsx
<TimeSelection
  views={['hours', 'minutes', 'seconds', 'milliseconds']}
  timeSteps={{milliseconds: 100}}
/>
```

### 12-hour clock

With `ampm` the hours column shows `12, 01 … 11`, and the AM/PM column is added after the others. The AM/PM column is not a view: it cannot be passed to `focusedView`, and `onFocusViewUpdate` is not called for it.

```tsx
<TimeSelection ampm />
```

### Steps

`timeSteps` sets the step between the options of a column; the default is `1` for every unit. If the value does not fit the step, nothing is selected in that column.

```tsx
<TimeSelection views={['hours', 'minutes', 'seconds']} timeSteps={{minutes: 5, seconds: 15}} />
```

## Size

To control the size of the rows use the `size` property. The columns are built on the uikit `List`, and `size` is passed to it as is: see [the sizes of the List](https://preview.gravity-ui.com/uikit/?path=/docs/components-data-display-list--docs#sizes). Default size is `m`.

```tsx
<TimeSelection size="s" />
<TimeSelection size="m" />
<TimeSelection size="l" />
<TimeSelection size="xl" />
```

A column shows seven rows by default and scrolls the rest. Set the height from the outside with `style` or `className`.

The selected option is scrolled to the middle of its column when the component mounts and when the selection changes. A pick in any column also brings the other columns back to their selected options if they were scrolled away. The first and the last options reach the middle too: there is empty room above and below the list for that.

## Focus

The component does not take focus on its own. Pass `defaultFocusView` to move focus into a column when the component mounts, or `focusedView` to move it whenever the property changes. `focusedView` is a request, not a lock: the user can still move focus to another column, and `onFocusViewUpdate` is called when that happens — by the keyboard, by a click, or after a pick. A column is entered at its selected option. When nothing is selected, it is entered at its first available option, or at the last one with `Shift+Tab`.

After an option is picked, focus goes to the next column; in the last column it stays.

```tsx
<TimeSelection defaultFocusView="hours" />
```

## States

### Disabled

The state of the `TimeSelection` where you don't want the user to be able to interact with the component. All the options are unavailable.

```tsx
<TimeSelection disabled={true} />
```

### Readonly

`readOnly` is a boolean attribute that, when set to true, makes the value immutable to the user. The options stay visible and can be navigated, but picking one does nothing.

```tsx
<TimeSelection readOnly={true} />
```

## Time zone

`timeZone` is the property to set the time zone the value is shown in. [Learn more about time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)

## Keyboard

Inside a column the keys are those of the uikit `List`: see [the keyboard of the List](https://preview.gravity-ui.com/uikit/?path=/docs/components-data-display-list--docs#keyboard). They only move through the options and do not change the value. `TimeSelection` adds:

| Key                      | Action                                                            |
| :----------------------- | :---------------------------------------------------------------- |
| `ArrowLeft` `ArrowRight` | Moves focus to the neighboring column; does not wrap at the edges |
| `Enter` `Space`          | Picks the option and moves focus to the next column               |

## Properties

| Name                                           | Description                                                                                                          |                           Type                            |        Default         |
| :--------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------: | :--------------------: |
| [ampm](#12-hour-clock)                         | Whether to use the 12-hour clock with the AM/PM column                                                               |                         `boolean`                         |        `false`         |
| aria-describedby                               | The control's `aria-describedby` attribute                                                                           |                         `string`                          |                        |
| aria-details                                   | The control's `aria-details` attribute                                                                               |                         `string`                          |                        |
| aria-label                                     | The control's `aria-label` attribute                                                                                 |                         `string`                          |                        |
| aria-labelledby                                | The control's `aria-labelledby` attribute                                                                            |                         `string`                          |                        |
| className                                      | The control's wrapper class name                                                                                     |                         `string`                          |                        |
| [defaultFocusView](#focus)                     | The column that takes focus when the component mounts (uncontrolled)                                                 |                    `TimeSelectionView`                    |                        |
| [defaultValue](#value)                         | Sets the initial value for uncontrolled component.                                                                   |                     `DateTime` `null`                     |                        |
| [disabled](#disabled)                          | Indicates that the user cannot interact with the control                                                             |                         `boolean`                         |        `false`         |
| [focusedView](#focus)                          | The column to move focus into on mount and whenever the property changes                                             |                    `TimeSelectionView`                    |                        |
| id                                             | The control's `id` attribute                                                                                         |                         `string`                          |                        |
| [isTimeUnavailable](#unavailable-time)         | Callback that is called for each option of a column. If it returns true, then the option is unavailable.             | `((value: DateTime, view: TimeSelectionView) => boolean)` |                        |
| [maxValue](#min-and-max-value)                 | The maximum allowed date and time that a user may select.                                                            |                        `DateTime`                         |                        |
| [minValue](#min-and-max-value)                 | The minimum allowed date and time that a user may select.                                                            |                        `DateTime`                         |                        |
| onBlur                                         | Fires when the control lost focus. Provides focus event as a callback's argument                                     |       `((e: FocusEvent<Element, Element>) => void)`       |                        |
| onFocus                                        | Fires when the control gets focus. Provides focus event as a callback's argument                                     |       `((e: FocusEvent<Element, Element>) => void)`       |                        |
| [onFocusViewUpdate](#focus)                    | Fires when focus moves to another column.                                                                            |           `((view: TimeSelectionView) => void)`           |                        |
| onUpdate                                       | Fires when the value is changed.                                                                                     |               `((value: DateTime) => void)`               |                        |
| [placeholderValue](#value)                     | The date and the units that are not picked yet while the value is empty                                              |                        `DateTime`                         |   today at midnight    |
| [readOnly](#readonly)                          | Whether the value is immutable.                                                                                      |                         `boolean`                         |        `false`         |
| [size](#size)                                  | The size of the rows                                                                                                 |                 `"s"` `"m"` `"l"` `"xl"`                  |         `"m"`          |
| [skipUnavailable](#hiding-unavailable-options) | Whether to leave the unavailable options out instead of showing them as disabled                                     |                         `boolean`                         |        `false`         |
| style                                          | Sets inline style for the element.                                                                                   |                      `CSSProperties`                      |                        |
| [timeSteps](#steps)                            | Steps between the options of a column                                                                                |       `Partial<Record<TimeSelectionView, number>>`        |                        |
| [timeZone](#time-zone)                         | Sets the time zone. [Learn more about time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List) |                         `string`                          |                        |
| [value](#value)                                | The value of the control                                                                                             |                     `DateTime` `null`                     |                        |
| [views](#views)                                | Units to show columns for                                                                                            |                   `TimeSelectionView[]`                   | `['hours', 'minutes']` |
