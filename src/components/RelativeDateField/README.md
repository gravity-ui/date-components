<!--GITHUB_BLOCK-->

# RelativeDateField

<!--/GITHUB_BLOCK-->

```tsx
import {RelativeDateField} from '@gravity-ui/date-components';
```

`RelativeDateField` component is a versatile and convenient input field specifically designed for date entry in React applications. With an intuitive interface and easy integration, it's perfect for any form that requires date or time input, such as event schedulers, booking systems, or data-driven reports. It can be controlled if you set `value` property. Or it can be uncontrolled if you don't set any value, but in this case you can manage the initial state with optional property `defaultValue`. Component is uncontrolled by default.

### Useful addition

To set dates in the right format you may need to include additional helpers from [Date Utils library](https://gravity-ui.com/libraries/date-utils)

```tsx
import {dateTimeParse} from '@gravity-ui/date-utils';
```

## Appearance

The appearance of `RelativeDateField` is controlled by the `size`, `view` and `pin` properties.

### Size

To control the size of the `RelativeDateField` use the `size` property. Default size is `m`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDateField size="s" />
<RelativeDateField size="m" />
<RelativeDateField size="l" />
<RelativeDateField size="xl" />
`}
>
    <DateComponents.RelativeDateField size="s" />
    <DateComponents.RelativeDateField size="m" />
    <DateComponents.RelativeDateField size="l" />
    <DateComponents.RelativeDateField size="xl" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDateField size="s" />
<RelativeDateField size="m" />
<RelativeDateField size="l" />
<RelativeDateField size="xl" />
```

<!--/GITHUB_BLOCK-->

### View

`normal` - the main view of `RelativeDateField` (used by default).

<!--LANDING_BLOCK
<ExampleBlock code={`<RelativeDateField />`}>
    <DateComponents.RelativeDateField />
</ExampleBlock>
LANDING_BLOCK-->

`clear` - view of `RelativeDateField` without visible borders (can be used with a custom wrapper)

<!--LANDING_BLOCK
<ExampleBlock code={`<RelativeDateField view="clear" />`}>
    <DateComponents.RelativeDateField view="clear" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDateField view="normal" />
<RelativeDateField view="clear" />
```

<!--/GITHUB_BLOCK-->

### Pin

The `pin` property allows you to control the shape of the right and left edges and is usually used for combining multiple controls in a single unit.
The value of the `pin` property consists of left and edge style names divided by a dash, e.g. `"round-brick"`.
The edge styles are: `round` (default), `circle`, `brick` and `clear`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDateField pin="round-brick" />
<RelativeDateField pin="brick-brick" />
<RelativeDateField pin="brick-round" />
`}
>
    <DateComponents.RelativeDateField pin="round-brick" />
    <DateComponents.RelativeDateField pin="brick-brick" />
    <DateComponents.RelativeDateField pin="brick-round" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDateField pin="round-brick" />
<RelativeDateField pin="brick-brick" />
<RelativeDateField pin="brick-round" />
```

<!--/GITHUB_BLOCK-->

## Value

`RelativeDateField` get and return values in special relative format. You set and get values as formulas which will help you to compute the exact date. We can call it `grafana-like format` because it is very similar to format of Grafana's relative time fields. To know more about relative time values in Grafana read [the docs](https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/).

Using this mode you can deliver your data from source to destination and compute the exact value straight on the necessary endpoit without inaccuracy.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDateField defaultValue="now-2d" />
`}
>
    <DateComponents.RelativeDateField defaultValue="now-2d"
    isRelative={true}/>
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDateField defaultValue="now-2d" />
```

<!--/GITHUB_BLOCK-->

## States

### Disabled

The state of the `RelativeDateField` where you don't want the user to be able to interact with the component.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDateField disabled={true} defaultValue="now-2d" />
`}
>
    <DateComponents.RelativeDateField disabled={true} defaultValue="now-2d" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDateField disabled defaultValue="now-2d" />
```

<!--/GITHUB_BLOCK-->

### Readonly

`readOnly` is a boolean attribute that, when set to true, makes the `RelativeDateField` component immutable to the user. This means that while the input will display its current value, users will not be able to change it.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDateField readOnly defaultValue="now-2d" />
`}
>
    <DateComponents.RelativeDateField readOnly defaultValue="now-2d" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDateField readOnly defaultValue="now-2d" />
```

<!--/GITHUB_BLOCK-->

### Error

The state of the `RelativeDateField` in which you want to indicate incorrect user input. To change `RelativeDateField` appearance, use the `validationState` property with the `"invalid"` value. An optional message text can be added via the `errorMessage` property. Message text will be rendered under the component.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDateField errorMessage="Error message" validationState="invalid" />
<RelativeDateField validationState="invalid" />
`}
>
    <DateComponents.RelativeDateField errorMessage="Error message" validationState="invalid" />
    <DateComponents.RelativeDateField validationState="invalid" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDateField errorMessage="Error message" validationState="invalid" />
<RelativeDateField validationState="invalid" />
```

<!--/GITHUB_BLOCK-->

## Additional content

### Placeholder

This prop allows you to provide a short hint that describes the expected value of the input field. This hint is displayed within the input field before the user enters a value, and it disappears upon the entry of text.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDateField placeholder='Placeholder' />
`}
>
    <DateComponents.RelativeDateField placeholder='Placeholder' />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDateField placeholder="Placeholder" />
```

<!--/GITHUB_BLOCK-->

### Label

Allows you to place the label in the left part of the field. Label can take up no more than half the width of the entire space of `RelativeDateField`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RelativeDateField label="Label" />
<RelativeDateField label="Very long label with huge amount of symbols" />
`}
>
    <DateComponents.RelativeDateField label="Label" />
    <DateComponents.RelativeDateField label="Very long label with huge amount of symbols" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDateField label="Label" />
```

<!--/GITHUB_BLOCK-->

### Clear button

`hasClear` is a boolean prop that, provides users with the ability to quickly clear the content of the input field.

<!--LANDING_BLOCK
<ExampleBlock
    code={`<RelativeDateField hasClear />`}
>
    <DateComponents.RelativeDateField
        hasClear
    />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDateField hasClear />
```

<!--/GITHUB_BLOCK-->

### Left content

Allows you to add content to the left part of the field. It is placed before all other components.

<!--LANDING_BLOCK
<ExampleBlock
    code={`<RelativeDateField label="Label" leftContent={<Label size="s">Left content</Label>} />`}
>
    <DateComponents.RelativeDateField
        label="Label"
        leftContent={<UIKit.Label size="s">Left content</UIKit.Label>}
    />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDateField label="Label" leftContent={<Label>Left content</Label>} />
```

<!--/GITHUB_BLOCK-->

### Right content

Allows you to add content to the right part of the field. It is placed after all other components.

<!--LANDING_BLOCK
<ExampleBlock
    code={`<RelativeDateField rightContent={<Label size="s">Right</Label>} hasClear/>`}
>
    <DateComponents.RelativeDateField
        hasClear
        rightContent={<UIKit.Label size="s">Right</UIKit.Label>}
    />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RelativeDateField hasClear rightContent={<Label>Right</Label>} />
```

<!--/GITHUB_BLOCK-->

## Time zone

`timeZone` is the property to set the time zone of the value in the input. [Learn more about time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)

## Properties

| Name                           | Description                                                                                                          |                     Type                      |     Default     |
| :----------------------------- | :------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------: | :-------------: |
| aria-describedby               | The control's `aria-describedby` attribute                                                                           |                   `string`                    |                 |
| aria-details                   | The control's `aria-details` attribute                                                                               |                   `string`                    |                 |
| aria-label                     | The control's `aria-label` attribute                                                                                 |                   `string`                    |                 |
| aria-labelledby                | The control's `aria-labelledby` attribute                                                                            |                   `string`                    |                 |
| autoFocus                      | The control's `autofocus` attribute                                                                                  |                   `boolean`                   |                 |
| className                      | The control's wrapper class name                                                                                     |                   `string`                    |                 |
| [defaultValue](#value)         | Sets the initial value for uncontrolled component.                                                                   |                   `string`                    |                 |
| [disabled](#disabled)          | Indicates that the user cannot interact with the control                                                             |                   `boolean`                   |     `false`     |
| [errorMessage](#error)         | Error text                                                                                                           |                  `ReactNode`                  |                 |
| [hasClear](#clear-button)      | Shows the icon for clearing control's value                                                                          |                   `boolean`                   |     `false`     |
| hasTime                        | Show time field in popupvalue                                                                                        |                   `boolean`                   |     `false`     |
| id                             | The control's `id` attribute                                                                                         |                   `string`                    |                 |
| [label](#label)                | Help text rendered to the left of the input node                                                                     |                   `string`                    |                 |
| [leftContent](#left-content)   | The user`s node rendered before label and input                                                                      |               `React.ReactNode`               |                 |
| onBlur                         | Fires when the control lost focus. Provides focus event as a callback's argument                                     | `((e: FocusEvent<Element, Element>) => void)` |                 |
| onFocus                        | Fires when the control gets focus. Provides focus event as a callback's argument                                     | `((e: FocusEvent<Element, Element>) => void)` |                 |
| onKeyDown                      | Fires when a key is pressed. Provides keyboard event as a callback's argument                                        |    `((e: KeyboardEvent<Element>) => void)`    |                 |
| onKeyUp                        | Fires when a key is released. Provides keyboard event as a callback's argument                                       |    `((e: KeyboardEvent<Element>) => void)`    |                 |
| onUpdate                       | Fires when the value is changed by the user. Provides new value as an callback's argument                            |      `((value: string \| null) => void`       |                 |
| [pin](#pin)                    | Corner rounding                                                                                                      |                   `string`                    | `'round-round'` |
| [placeholder](#placeholder)    | Text that appears in the control when it has no value set                                                            |                   `string`                    |                 |
| [readOnly](#readonly)          | Whether the component's value is immutable.                                                                          |                   `boolean`                   |     `false`     |
| [rightContent](#right-content) | User`s node rendered after the input node and clear button                                                           |               `React.ReactNode`               |                 |
| [size](#size)                  | The size of the control                                                                                              |           `"s"` `"m"` `"l"` `"xl"`            |      `"m"`      |
| style                          | Sets inline style for the element.                                                                                   |                `CSSProperties`                |                 |
| [timeZone](#time-zone)         | Sets the time zone. [Learn more about time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List) |                   `string`                    |                 |
| validationState                | Validation state                                                                                                     |                  `"invalid"`                  |                 |
| [value](#value)                | The value of the control                                                                                             |                `string` `null`                |                 |
| [view](#view)                  | The view of the control                                                                                              |             `"normal"` `"clear"`              |   `"normal"`    |
