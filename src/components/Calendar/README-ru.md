<!--GITHUB_BLOCK-->

# Calendar

<!--/GITHUB_BLOCK-->

```tsx
import {Calendar} from '@gravity-ui/date-components';
```

`Calendar` — это гибкий и удобный компонент календаря для React-приложений. Он позволяет пользователям легко выбирать, просматривать и настраивать даты, что делает его отличным решением для планирования событий, систем бронирования и других задач, требующих выбора даты. Компонент становится контролируемым при установке свойства `value`. Если это значение не задано, компонент используется в неконтролируемом режиме. В этом случае задать начальное состояние можно через дополнительное свойство `defaultValue`. По умолчанию `Calendar` — неконтролируемый компонент.

### Полезная рекомендация

Для установки дат в правильном формате может понадобиться подключение вспомогательных функций из [библиотеки Date Utils](https://gravity-ui.com/libraries/date-utils).

```tsx
import {dateTimeParse} from '@gravity-ui/date-utils';
```

## Размер

Для изменения размера `Calendar` используйте свойство `size`. Размер по умолчанию — `m`.

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

## Значение

### Минимальное и максимальное значения

Свойство `minValue` позволяет задать наиболее ранние дату и время, которые может ввести пользователь. Свойство `maxValue`, в свою очередь, определяет наиболее поздние дату и время, которые доступны для ввода. Все остальные значения будут недоступны для пользователя.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<Calendar minValue={dateTimeParse('01.01.2024')} maxValue={dateTimeParse('01.01.2025')} />
`}
>
    <DateComponentsExamples.CalendarExample minValue={'01.01.2024'} maxValue={'01.01.2025'}/>
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<Calendar minValue={dateTimeParse('01.01.2024')} maxValue={dateTimeParse('01.01.2025')} />
```

<!--/GITHUB_BLOCK-->

## Режим отображения

Определяет временной интервал, который будет отображаться в компоненте `Calendar`. С помощью свойства `mode` можно задать нужный интервал для контролируемого компонента. Для неконтролируемого компонента значение этого свойства указывать не требуется, а начальный режим отображения можно задать через `defaultMode`.

`days` — режим по умолчанию для `Calendar`. Отображает календарь с днями месяца.

`months` — отображает календарь с месяцами года.

`quarters` — отображает календарь с кварталами по годам (недоступно в качестве значения для `defaultMode`).

`years` — отображает календарь с несколькими годами для выбора.

С помощью свойства `modes` можно указать, какие режимы будут доступны пользователю.

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

## Состояния

### `Disabled` (отключен)

Состояние `Calendar`, при котором пользователь не может взаимодействовать с компонентом.

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
<Calendar disabled={true} />
```

<!--/GITHUB_BLOCK-->

### `readOnly` (только для чтения)

`readOnly` — это булев атрибут, который при установке в `true` делает компонент `Calendar` недоступным для редактирования пользователем. Это означает, что пользователи видят текущее значение поля, но не могут его изменить.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<Calendar readOnly={true} />
`}
>
    <DateComponents.Calendar readOnly={true} />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<Calendar readOnly={true} />
```

<!--/GITHUB_BLOCK-->

## Значение, получающее фокус

Позволяет выбрать дату, на которой будет установлен фокус представления `Calendar`. Если необходимо контролировать это значение, используйте свойство `focusedValue`. Для неконтролируемого компонента начальное значение, получающее фокус, можно установить через `defaultFocusedValue`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<Calendar defaultFocusedValue={dateTimeParse('01.01.2020')} />
`}
>
    <DateComponentsExamples.CalendarExample defaultFocusedValue={'01.01.2020'} />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<Calendar defaultFocusedValue={dateTimeParse('01.01.2020')} />
```

<!--/GITHUB_BLOCK-->

## Часовой пояс

`timeZone` — это свойство, позволяющее задать часовой пояс для значения в поле ввода. Подробнее о часовых поясах см. [здесь](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List).

## Свойства

| Имя                                   | Описание                                                                                                                        |                               Тип                                |                    Значение по умолчанию                    |
| :------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------: | :---------------------------------------------------------: |
| aria-describedby                      | Атрибут `aria-describedby` для контрола.                                                                                        |                             `string`                             |                                                             |
| aria-details                          | Атрибут `aria-details` для контрола.                                                                                            |                             `string`                             |                                                             |
| aria-label                            | Атрибут `aria-label` для контрола.                                                                                              |                             `string`                             |                                                             |
| aria-labelledby                       | Атрибут `aria-labelledby` для контрола.                                                                                         |                             `string`                             |                                                             |
| autoFocus                             | Атрибут `autofocus` для контрола.                                                                                               |                            `boolean`                             |                                                             |
| className                             | Имя класса обертки контрола.                                                                                                    |                             `string`                             |                                                             |
| [defaultFocusedValue](#focused-value) | Дата, на которую устанавливается фокус при первом открытии календаря (если компонент неконтролируемый).                         |                            `DateTime`                            |                                                             |
| [defaultMode](#mode)                  | Начальный режим отображения календаря.                                                                                          |                `days` `months` `quarters` `years`                |                                                             |
| [defaultValue](#value)                | Задает начальное значение для неконтролируемого компонента.                                                                     |                            `DateTime`                            |                                                             |
| [disabled](#disabled)                 | Указывает на то, что пользователь не может взаимодействовать с контролом.                                                       |                            `boolean`                             |                           `false`                           |
| [focusedValue](#focused-value)        | Устанавливает вид неконтролируемого компонента по умолчанию, включающий данное значение.                                        |                        `DateTime` `null`                         |                                                             |
| id                                    | Атрибут `id` для контрола.                                                                                                      |                             `string`                             |                                                             |
| isDateUnavailable                     | Функция обратного вызова для каждой даты в календаре. Если она возвращает `true`, дата недоступна для выбора.                   |                 `((date: DateTime) => boolean)`                  |                                                             |
| isWeekend                             | Функция обратного вызова для каждой даты в календаре. Если она возвращает `true`, дата является выходным днем.                  |                 `((date: DateTime) => boolean)`                  |                                                             |
| [maxValue](#min-and-max-value)        | Верхний предел выбора даты.                                                                                                     |                            `DateTime`                            |                                                             |
| [minValue](#min-and-max-value)        | Нижний предел выбора даты.                                                                                                      |                            `DateTime`                            |                                                             |
| [mode](#mode)                         | Определяет временной интервал, который будет отображаться в контролируемом компоненте `Calendar`.                               |                `days` `months` `quarters` `years`                |                                                             |
| modes                                 | Режимы, доступные для выбора пользователем.                                                                                     |            `Partial<Record<CalendarLayout, boolean>>`            | `{days: true, months: true, quarters: false, years: true }` |
| onBlur                                | Срабатывает, когда контрол теряет фокус. Передает событие фокуса в качестве аргумента обратного вызова.                         |          `((e: FocusEvent<Element, Element>) => void)`           |                                                             |
| onFocus                               | Срабатывает, когда контрол получает фокус. Передает событие фокуса в качестве аргумента обратного вызова.                       |          `((e: FocusEvent<Element, Element>) => void)`           |                                                             |
| onFocusUpdate                         | Срабатывает при изменении даты, на которой фокусируется контрол.                                                                |                   `((date: DateTime) => void)`                   |                                                             |
| onUpdate                              | Срабатывает при изменении значения.                                                                                             |                   `((value: DateTime) => void`                   |                                                             |
| onUpdateMode                          | Срабатывает при изменении режима.                                                                                               | `((value: 'days' \| 'months' \| 'quarters' \| 'years' ) => void` |                                                             |
| [readOnly](#readonly)                 | Определяет, можно ли изменять значение календаря.                                                                               |                            `boolean`                             |                           `false`                           |
| [size](#size)                         | Размер контрола.                                                                                                                |                        `"m"` `"l"` `"xl"`                        |                            `"m"`                            |
| style                                 | Задает инлайн-стиль для элемента.                                                                                               |                         `CSSProperties`                          |                                                             |
| [timeZone](#time-zone)                | Задает часовой пояс. Подробнее о часовых поясах см. [здесь](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |                             `string`                             |                                                             |
| [value](#calendar)                    | Значение контрола.                                                                                                              |                        `DateTime` `null`                         |                                                             |
