<!--GITHUB_BLOCK-->

# Calendar

<!--/GITHUB_BLOCK-->

```tsx
import {Calendar} from '@gravity-ui/date-components';
```

`Calendar` is a flexible, user-friendly calendar component for React applications. It allows users to view, select, and manage dates with ease. Ideal for event scheduling, booking systems, and any application where date selection is essential. It can be controlled if you set `value` property. Or it can be uncontrolled if you don't set any value, but in this case you can manage the initial state with optional property `defaultValue`. Component is uncontrolled by default.

## Size

To control the size of the `Calendar` use the `size` property. Default size is `m`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<Calendar size="m" />
<Calendar size="l" />
<Calendar size="xl" />
`}
>
    <DateComponents.Calendar size="m" />
    <DateComponents.Calendar size="l" />
    <DateComponents.Calendar size="xl" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<Calendar size="m" />
<Calendar size="l" />
<Calendar size="xl" />
```

<!--/GITHUB_BLOCK-->

## Value

### Min and max value

The `minValue` property allows you to specify the earliest date and time that can be entered by the user. Conversely, the `maxValue` property specifies the latest date and time that can be entered. If you input the value out of this bounds component changes it's view like in case of invalid validation state.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<Calendar minValue={new Date('01.01.2024')} maxValue={new Date('01.01.2025')} />
`}
>
    <DateComponents.Calendar minValue={new Date('01.01.2024')} maxValue={new Date('01.01.2025')}/>
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
import {dateTimeParse} from '@gravity-ui/date-utils';

<Calendar minValue={dateTimeParse('01.01.2024')} maxValue={dateTimeParse('01.01.2025')} />;
```

<!--/GITHUB_BLOCK-->

## Mode

Defines the time interval that `Calendar` should display. With `mode` you can choose it in controlled way. For uncontrolled way you don't need to specify any value. Also you can set the initial mode in uncontrolled way with `defaultMode` prop.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<Calendar defaultMode="months"/>
`}
>
    <DateComponents.Calendar defaultMode="months" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<Calendar defaultMode="months" />
```

<!--/GITHUB_BLOCK-->

## States

### Disabled

The state of the `Calendar` where you don't want the user to be able to interact with the component.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<Calendar disabled={true} />
`}
>
    <DateComponents.Calendar disabled={true} />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<Calendar disabled />
```

<!--/GITHUB_BLOCK-->

### Readonly

`readOnly` is a boolean attribute that, when set to true, makes the `Calendar` component immutable to the user. This means that while the input will display its current value, users will not be able to change it.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<Calendar readOnly />
`}
>
    <DateComponents.Calendar readOnly />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<Calendar readOnly />
```

<!--/GITHUB_BLOCK-->

## Focused value

Allows to select the date that is focused when `Calendar` first mounts. If you need it to be controlled you shoud use `focusedValue` prop. You can set the initial focused value for uncontrolled component with optional prop `defaultFocusedValue`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<Calendar defaultFocusedValue={'01.01.2025'} />
`}
>
    <DateComponents.Calendar defaultFocusedValue={'01.01.2025'} />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
import {dateTimeParse} from '@gravity-ui/date-utils';

<Calendar defaultFocusedValue={dateTimeParse('01.01.2025')} />;
```

<!--/GITHUB_BLOCK-->
