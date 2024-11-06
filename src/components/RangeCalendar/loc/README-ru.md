<!--GITHUB_BLOCK-->

# RangeCalendar

<!--/GITHUB_BLOCK-->

```tsx
import {RangeCalendar} from '@gravity-ui/date-components';
```

`RangeCalendar` — это полнофункциональный, гибкий и удобный UI-компонент для выбора диапазона дат. Он создан на базе React и сочетает в себе функциональность календаря и элемента для выбора диапазона дат, что делает его идеальным решением для приложений, требующих ввода начальной и конечной дат. Компонент становится контролируемым при установке свойства `value`. Если это значение не задано, компонент используется в неконтролируемом режиме. В этом случае задать начальное состояние можно через дополнительное свойство `defaultValue`. По умолчанию `RangeCalendar` — неконтролируемый компонент.

### Полезная рекомендация

Для установки дат в правильном формате может понадобиться подключение вспомогательных функций из [библиотеки Date Utils](https://gravity-ui.com/libraries/date-utils).

```tsx
import {dateTimeParse, dateTime} from '@gravity-ui/date-utils';
```

<!--LANDING_BLOCK

> [!NOTE]
> Row with "Selected range: ..." is not a part of the component. It was added to examples only for clarity.

LANDING_BLOCK-->

## Размер

Для изменения размера `RangeCalendar` используйте свойство `size`. Размер по умолчанию — `m`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RangeCalendar size="m" />
<RangeCalendar size="l" />
<RangeCalendar size="xl" />
`}
>
    <DateComponentsExamples.RangeCalendarExample size="m" />
    <DateComponentsExamples.RangeCalendarExample size="l" />
    <DateComponentsExamples.RangeCalendarExample size="xl" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RangeCalendar size="m" />
<RangeCalendar size="l" />
<RangeCalendar size="xl" />
```

<!--/GITHUB_BLOCK-->

## Значение

### Минимальное и максимальное значения

Свойство `minValue` позволяет задать наиболее ранние дату и время, которые может ввести пользователь. Свойство `maxValue`, в свою очередь, определяет наиболее поздние дату и время, которые доступны для ввода. Все остальные значения будут недоступны для пользователя.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RangeCalendar minValue={dateTimeParse('01.01.2024')} maxValue={dateTimeParse('01.01.2025')} />
`}
>
    <DateComponentsExamples.RangeCalendarExample minValue={'01.01.2024'} maxValue={'01.01.2025'}/>
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RangeCalendar minValue={dateTimeParse('01.01.2024')} maxValue={dateTimeParse('01.01.2025')} />
```

<!--/GITHUB_BLOCK-->

## Режим

Определяет временной интервал, который будет отображаться в компоненте `RangeCalendar`. С помощью свойства `mode` можно задать нужный интервал для контролируемого компонента. Для неконтролируемого компонента значение этого свойства указывать не требуется, а начальный режим отображения можно задать через `defaultMode`.

`days` — режим по умолчанию для `RangeCalendar`. Отображает календарь с днями месяца.

`months` — отображает календарь с месяцами года.

`quarters` — отображает календарь с кварталами по годам (недоступно в качестве значения для `defaultMode`).

`years` — отображает календарь с несколькими годами для выбора.

С помощью свойства `modes` можно указать, какие режимы будут доступны пользователю.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RangeCalendar defaultMode="months"/>
`}
>
    <DateComponentsExamples.RangeCalendarExample defaultMode="months" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RangeCalendar defaultMode="months" />
```

<!--/GITHUB_BLOCK-->

## Состояния

### `Disabled` (отключен)

Состояние `RangeCalendar`, при котором пользователь не может взаимодействовать с компонентом.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RangeCalendar
  disabled={true}
  defaultValue={{start: dateTime().add({days: 2}), end: dateTime().subtract({days: 2})}}
/>
`}
>
    <DateComponentsExamples.RangeCalendarWithDefaultValueExample disabled={true} />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RangeCalendar
  disabled={true}
  defaultValue={{start: dateTime().add({days: 2}), end: dateTime().subtract({days: 2})}}
/>
```

<!--/GITHUB_BLOCK-->

### `readOnly` (только для чтения)

`readOnly` — это булев атрибут, который при установке в `true` делает компонент `RangeCalendar` недоступным для редактирования пользователем. Это означает, что пользователи видят текущее значение поля, но не могут его изменить.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RangeCalendar
  readOnly={true}
  defaultValue={{start: dateTime().add({days: 2}), end: dateTime().subtract({days: 2})}}
/>
`}
>
    <DateComponentsExamples.RangeCalendarWithDefaultValueExample readOnly={true} />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RangeCalendar
  readOnly={true}
  defaultValue={{start: dateTime().add({days: 2}), end: dateTime().subtract({days: 2})}}
/>
```

<!--/GITHUB_BLOCK-->

## Значение, получающее фокус

Позволяет выбрать дату, на которой будет установлен фокус представления `RangeCalendar`. Если необходимо контролировать это значение, используйте свойство `focusedValue`. Для неконтролируемого компонента начальное значение, получающее фокус, можно установить через `defaultFocusedValue`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<RangeCalendar
  defaultFocusedValue={dateTimeParse('01.01.2020')} defaultValue={{start: dateTime().add({days: 2}), end: dateTime().subtract({days: 2})}}
/>
`}
>
    <DateComponentsExamples.RangeCalendarWithDefaultValueExample defaultFocusedValue={'01.01.2020'} />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<RangeCalendar
  defaultFocusedValue={dateTimeParse('01.01.2020')}
  defaultValue={{start: dateTime().add({days: 2}), end: dateTime().subtract({days: 2})}}
/>
```

<!--/GITHUB_BLOCK-->

## Часовой пояс

`timeZone` — это свойство, позволяющее задать часовой пояс для значения в поле ввода. Подробнее о часовых поясах см. [здесь](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List).

## Свойства

| Имя                                  | Описание                                                                                                          |                               Тип                               |                           Значение по умолчанию                           |
| :------------------------------------ | :------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------: | :---------------------------------------------------------: |
| aria-describedby                      | Атрибут `aria-describedby` для контрола.                                                                           |                             `string`                             |                                                             |
| aria-details                          | Атрибут `aria-details` для контрола.                                                                               |                             `string`                             |                                                             |
| aria-label                            | Атрибут `aria-label` для контрола.                                                                                 |                             `string`                             |                                                             |
| aria-labelledby                       | Атрибут `aria-labelledby` для контрола.                                                                            |                             `string`                             |                                                             |
| autoFocus                             | Атрибут `autofocus` для контрола.                                                                                  |                            `boolean`                             |                                                             |
| className                             | Имя класса обертки контрола.                                                                                     |                             `string`                             |                                                             |
| [defaultFocusedValue](#focused-value) | Дата, на которую устанавливается фокус при первом открытии календаря (если компонент неконтролируемый).                                               |                            `DateTime`                            |                                                             |
| [defaultMode](#mode)                  | Начальный режим отображения календаря.                                                                                     |                `days` `months` `quarters` `years`                |                                                             |
| [defaultValue](#value)                | Задает начальное значение для неконтролируемого компонента.                                                                   |                      `RangeValue<DateTime>`                      |                                                             |
| [disabled](#disabled)                 | Указывает на то, что пользователь не может взаимодействовать с контролом.                                                             |                            `boolean`                             |                           `false`                           |
| [focusedValue](#focused-value)        | Устанавливает вид неконтролируемого компонента по умолчанию, включающий данное значение.                                             |                        `DateTime` `null`                         |                                                             |
| id                                    | Атрибут `id` для контрола.                                                                                         |                             `string`                             |                                                             |
| isDateUnavailable                     | Функция обратного вызова для каждой даты в календаре. Если она возвращает `true`, дата недоступна для выбора.             |                 `((date: DateTime) => boolean)`                  |                                                             |
| isWeekend                             | Функция обратного вызова для каждой даты в календаре. Если она возвращает `true`, дата является выходным днем.                 |                 `((date: DateTime) => boolean)`                  |                                                             |
| [maxValue](#min-and-max-value)        | Верхний предел выбора даты.                                                                     |                            `DateTime`                            |                                                             |
| [minValue](#min-and-max-value)        | Нижний предел выбора даты.                                                                     |                            `DateTime`                            |                                                             |
| [mode](#mode)                         | Определяет временной интервал, который будет отображаться в контролируемом компоненте `RangeCalendar`.                                    |                `days` `months` `quarters` `years`                |                                                             |
| modes                                 | Режимы, доступные для выбора пользователем.                                                                                              |         `Partial<Record<RangeCalendarLayout, boolean>>`          | `{days: true, months: true, quarters: false, years: true }` |
| onBlur                                | Срабатывает, когда контрол теряет фокус. Передает событие фокуса в качестве аргумента обратного вызова.                                     |          `((e: FocusEvent<Element, Element>) => void)`           |                                                             |
| onFocus                               | Срабатывает, когда контрол получает фокус. Передает событие фокуса в качестве аргумента обратного вызова.                                     |          `((e: FocusEvent<Element, Element>) => void)`           |                                                             |
| onFocusUpdate                         | Срабатывает при изменении даты, на которой фокусируется контрол.                                                                       |                   `((date: DateTime) => void)`                   |                                                             |
| onUpdate                              | Срабатывает при изменении значения.                                                                                     |                   `((value: DateTime) => void`                   |                                                             |
| onUpdateMode                          | Срабатывает при изменении режима.                                                                                      | `((value: 'days' \| 'months' \| 'quarters' \| 'years' ) => void` |                                                             |
| [readOnly](#readonly)                 | Определяет, можно ли изменять значение календаря.                                                                             |                            `boolean`                             |                           `false`                           |
| [size](#size)                         | Размер контрола.                                                                                              |                        `"m"` `"l"` `"xl"`                        |                            `"m"`                            |
| style                                 | Задает инлайн-стиль для элемента.                                                                                   |                         `CSSProperties`                          |                                                             |
| [timeZone](#time-zone)                | Задает часовой пояс. Подробнее о часовых поясах см. [здесь](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |                             `string`                             |                                                             |
| [value](#calendar)                    | Значение контрола.                                                                                             |                  `RangeValue<DateTime>` `null`                   |                                                             |