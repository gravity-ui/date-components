<!--GITHUB_BLOCK-->

# RelativeDatePicker

<!--/GITHUB_BLOCK-->

```tsx
import {RelativeDatePicker} from '@gravity-ui/date-components';
```

`RelativeDatePicker` is a sophisticated, lightweight, and fully customizable component designed to provide intuitive date picking functionality in your React applications. Built with user experience and ease of integration in mind, it fits seamlessly within forms, modals, or any UI element requiring date input. It can be controlled if you set `value` property. Or it can be uncontrolled if you don't set any value, but in this case you can manage the initial state with optional property `defaultValue`. Component is uncontrolled by default.

### Useful addition

To set dates in the right format you may need to include additional helpers from [Date Utils library](https://gravity-ui.com/libraries/date-utils)

```tsx
import {dateTimeParse, dateTime} from '@gravity-ui/date-utils';
```

## Difference from `DatePicker`

`RelativeDatePicker` can work in two modes: `absolute` and `relative`. You can switch it interactively by click on `f(x)` button. Or you can set field `type` in `value` or `defaultValue` object.

### Absolute

`RelativeDatePicker`'s behaviour in `absolute` mode is very similar to simple `DatePicker`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDatePicker defaultValue={{type: 'absolute', value:new Date()}} />
`}
>
    <DateComponentsExamples.RelativeDatePickerExample defaultValue={{type: 'absolute', value: new Date()}} />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDatePicker defaultValue={{type: 'absolute', value: new Date()}} />
```

<!--/GITHUB_BLOCK-->

### Relative

In this mode `RelativeDatePicker` get and return values in special relative format. You set and get values as formulas which will help you to compute the exact date. We can call it `grafana-like format` because it is very similar to format of Grafana's relative time fields. To know more about relative time values in Grafana read [the docs](https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/).

Using this mode you can deliver your data from source to destination and compute the exact value straight on the necessary endpoit without inaccuracy.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDatePicker defaultValue={{type: 'relative', value: 'now-2d'}} />
`}
>
    <DateComponentsExamples.RelativeDatePickerExample defaultValue={'now-2d'}
    isRelative={true}/>
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDatePicker defaultValue={{type: 'relative', value: 'now-2d'}} />
```

<!--/GITHUB_BLOCK-->

## Appearance

The appearance of `RelativeDatePicker` is controlled by the `size`, `view` and `pin` properties.

### Size

To control the size of the `RelativeDatePicker` use the `size` property. Default size is `m`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDatePicker size="s" />
<RelativeDatePicker size="m" />
<RelativeDatePicker size="l" />
<RelativeDatePicker size="xl" />
`}
>
    <DateComponents.RelativeDatePicker size="s" />
    <DateComponents.RelativeDatePicker size="m" />
    <DateComponents.RelativeDatePicker size="l" />
    <DateComponents.RelativeDatePicker size="xl" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDatePicker size="s" />
<RelativeDatePicker size="m" />
<RelativeDatePicker size="l" />
<RelativeDatePicker size="xl" />
```

<!--/GITHUB_BLOCK-->

### View

`normal` - the main view of `RelativeDatePicker` (used by default).

<!--LANDING_BLOCK
<ExampleBlock code={`<RelativeDatePicker />`}>
    <DateComponents.RelativeDatePicker />
</ExampleBlock>
LANDING_BLOCK-->

`clear` - view of `RelativeDatePicker` without visible borders (can be used with a custom wrapper)

<!--LANDING_BLOCK
<ExampleBlock code={`<RelativeDatePicker view="clear" />`}>
    <DateComponents.RelativeDatePicker view="clear" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDatePicker view="normal" />
<RelativeDatePicker view="clear" />
```

<!--/GITHUB_BLOCK-->

### Pin

The `pin` property allows you to control the shape of the right and left edges and is usually used for combining multiple controls in a single unit.
The value of the `pin` property consists of left and edge style names divided by a dash, e.g. `"round-brick"`.
The edge styles are: `round` (default), `circle`, `brick` and `clear`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDatePicker pin="round-brick" />
<RelativeDatePicker pin="brick-brick" />
<RelativeDatePicker pin="brick-round" />
`}
>
    <DateComponents.RelativeDatePicker pin="round-brick" />
    <DateComponents.RelativeDatePicker pin="brick-brick" />
    <DateComponents.RelativeDatePicker pin="brick-round" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDatePicker pin="round-brick" />
<RelativeDatePicker pin="brick-brick" />
<RelativeDatePicker pin="brick-round" />
```

<!--/GITHUB_BLOCK-->

## Value

### Min and max value

The `minValue` property allows you to specify the earliest date and time that can be entered by the user. Conversely, the `maxValue` property specifies the latest date and time that can be entered. If you input the value out of this bounds component changes it's view like in case of invalid validation state.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDatePicker minValue={dateTimeParse('01.01.2024')} placeholder={"minValue: '01.01.2024'"}/>
<RelativeDatePicker maxValue={dateTimeParse('01.01.2025')} placeholder={"maxValue: '01.01.2025'"}/>
`}
>
    <DateComponentsExamples.RelativeDatePickerExample minValue={'01.01.2024'} placeholder={"minValue: '01.01.2024'"} />
    <DateComponentsExamples.RelativeDatePickerExample maxValue={'01.01.2025'} placeholder={"maxValue: '01.01.2025'"} />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx

<RelativeDatePicker minValue={dateTimeParse('01.01.2024')} />
<RelativeDatePicker maxValue={dateTimeParse('01.01.2025')} />
```

<!--/GITHUB_BLOCK-->

## States

### Disabled

The state of the `RelativeDatePicker` where you don't want the user to be able to interact with the component.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDatePicker disabled={true} defaultValue={dateTime()} />
`}
>
    <DateComponentsExamples.RelativeDatePickerExample disabled={true} defaultValue={new Date()} />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDatePicker disabled defaultValue={dateTime()} />
```

<!--/GITHUB_BLOCK-->

### Readonly

`readOnly` is a boolean attribute that, when set to true, makes the `RelativeDatePicker` component immutable to the user. This means that while the input will display its current value, users will not be able to change it.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDatePicker readOnly defaultValue={dateTimeParse(dateTime()} />
`}
>
    <DateComponentsExamples.RelativeDatePickerExample readOnly defaultValue={new Date()} />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDatePicker readOnly defaultValue={dateTime()} />
```

<!--/GITHUB_BLOCK-->

### Error

The state of the `RelativeDatePicker` in which you want to indicate incorrect user input. To change `RelativeDatePicker` appearance, use the `validationState` property with the `"invalid"` value. An optional message text can be added via the `errorMessage` property. Message text will be rendered under the component.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDatePicker errorMessage="Error message" validationState="invalid" />
<RelativeDatePicker validationState="invalid" />
`}
>
    <DateComponents.RelativeDatePicker errorMessage="Error message" validationState="invalid" />
    <DateComponents.RelativeDatePicker validationState="invalid" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDatePicker errorMessage="Error message" validationState="invalid" />
<RelativeDatePicker validationState="invalid" />
```

<!--/GITHUB_BLOCK-->

## Additional content

### Placeholder

This prop allows you to provide a short hint that describes the expected value of the input field. This hint is displayed within the input field before the user enters a value, and it disappears upon the entry of text.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDatePicker placeholder="Placeholder" />
`}
>
    <DateComponents.RelativeDatePicker placeholder='Placeholder' />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDatePicker placeholder="Placeholder" />
```

<!--/GITHUB_BLOCK-->

### Label

Allows you to place the label in the left part of the field. Label can take up no more than half the width of the entire space of `RelativeDatePicker`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDatePicker label="Label" />
<RelativeDatePicker label="Very very very very long label with huge amount of symbols" />
`}
>
    <DateComponents.RelativeDatePicker label="Label" />
    <DateComponents.RelativeDatePicker label="Very long label with huge amount of symbols" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDatePicker label="Label" />
```

<!--/GITHUB_BLOCK-->

### Clear button

`hasClear` is a boolean prop that, provides users with the ability to quickly clear the content of the input field.

<!--LANDING_BLOCK
<ExampleBlock
    code={`<RelativeDatePicker hasClear />`}
>
    <DateComponents.RelativeDatePicker
        hasClear
    />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDatePicker hasClear />
```

<!--/GITHUB_BLOCK-->

## Format

The `format` prop is a string that defines the date and time format the `RelativeDatePicker` component will accept and display. This prop determines how the date and time are visually presented to the user and how the user's input is expected to be formatted. [Available formats](https://day.js.org/docs/en/display/format)

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDatePicker format='LL' />
`}
>
    <DateComponents.RelativeDatePicker format='LL' />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDatePicker format="LL" />
```

<!--/GITHUB_BLOCK-->

## Time zone

`timeZone` is the property to set the time zone of the value in the input. [Learn more about time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)

## Customisation

If you want to use custom calendar component inside `RelativeDatePicker` you can pass it as `children` with calendar like props.

<!--LANDING_BLOCK
[Learn more about calendar](https://gravity-ui.com/components/date-components/calendar)
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

[Learn more about calendar](https://github.com/gravity-ui/date-components/blob/main/src/components/Calendar/README.md)

<!--/GITHUB_BLOCK-->

## Properties

| Name                           | Description                                                                                                                                |                     Type                      |          Default          |
| :----------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------: | :-----------------------: |
| aria-describedby               | The control's `aria-describedby`. Identifies the element (or elements) that describes the object. attribute                                |                   `string`                    |                           |
| aria-details                   | The control's `aria-details`. Identifies the element (or elements) that provide a detailed, extended description for the object. attribute |                   `string`                    |                           |
| aria-label                     | The control's `aria-label`. Defines a string value that labels the current element. attribute                                              |                   `string`                    |                           |
| aria-labelledby                | The control's `aria-labelledby`. Identifies the element (or elements) that labels the current element. attribute                           |                   `string`                    |                           |
| autoFocus                      | The control's `autofocus`. Whether the element should receive focus on render. attribute                                                   |                   `boolean`                   |                           |
| className                      | The control's wrapper class name                                                                                                           |                   `string`                    |                           |
| [defaultValue](#datepicker)    | Sets the initial value for uncontrolled component.                                                                                         |                    `Value`                    |                           |
| [disabled](#disabled)          | Indicates that the user cannot interact with the control                                                                                   |                   `boolean`                   |          `false`          |
| [errorMessage](#error)         | Error text                                                                                                                                 |                  `ReactNode`                  |                           |
| [format](#format)              | Format of the date when rendered in the input. [Available formats](https://day.js.org/docs/en/display/format)                              |                   `string`                    |                           |
| [hasClear](#clear-button)      | Shows the icon for clearing control's value                                                                                                |                   `boolean`                   |          `false`          |
| id                             | The control's `id` attribute                                                                                                               |                   `string`                    |                           |
| isDateUnavailable              | Callback that is called for each date of the calendar. If it returns true, then the date is unavailable.                                   |        `((date: DateTime) => boolean)`        |                           |
| [label](#label)                | Help text rendered to the left of the input node                                                                                           |                   `string`                    |                           |
| [maxValue](#min-and-max-value) | The maximum allowed date that a user may select.                                                                                           |                  `DateTime`                   |                           |
| [minValue](#min-and-max-value) | The minimum allowed date that a user may select.                                                                                           |                  `DateTime`                   |                           |
| onBlur                         | Fires when the control lost focus. Provides focus event as a callback's argument                                                           | `((e: FocusEvent<Element, Element>) => void)` |                           |
| onFocus                        | Fires when the control gets focus. Provides focus event as a callback's argument                                                           | `((e: FocusEvent<Element, Element>) => void)` |                           |
| onKeyDown                      | Fires when a key is pressed. Provides keyboard event as a callback's argument                                                              |    `((e: KeyboardEvent<Element>) => void)`    |                           |
| onKeyUp                        | Fires when a key is released. Provides keyboard event as a callback's argument                                                             |    `((e: KeyboardEvent<Element>) => void)`    |                           |
| onUpdate                       | Fires when the value is changed by the user. Provides new value as an callback's argument                                                  |     `((value: DateTime \| null) => void`      |                           |
| [pin](#pin)                    | Corner rounding                                                                                                                            |                `TextInputPin`                 |      `'round-round'`      |
| [placeholder](#placeholder)    | Text that appears in the control when it has no value set                                                                                  |                   `string`                    |                           |
| placeholderValue               | A placeholder date that controls the default values of each segment when the user first interacts with them.                               |                  `DateTime`                   | `today's date at midnigh` |
| [readOnly](#readonly)          | Whether the component's value is immutable.                                                                                                |                   `boolean`                   |          `false`          |
| [size](#size)                  | The size of the control                                                                                                                    |           `"s"` `"m"` `"l"` `"xl"`            |           `"m"`           |
| style                          | Sets inline style for the element.                                                                                                         |                `CSSProperties`                |                           |
| [timeZone](#time-zone)         | Sets the time zone. [Learn more about time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)                       |                   `string`                    |                           |
| [validationState](#error)      | Validation state                                                                                                                           |                  `"invalid"`                  |                           |
| [value](#datepicker)           | The value of the control                                                                                                                   |                `Value` `null`                 |                           |
| [view](#view)                  | The view of the control                                                                                                                    |             `"normal"` `"clear"`              |        `"normal"`         |
