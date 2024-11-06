<!--GITHUB_BLOCK-->

# DatePicker

<!--/GITHUB_BLOCK-->

```tsx
import {DatePicker} from '@gravity-ui/date-components';
```

`DatePicker` — удобный, легкий и полностью настраиваемый компонент, обеспечивающий интуитивно понятный выбор дат в React-приложениях. Благодаря своей ориентированности на удобство пользователя и простоту интеграции, `DatePicker` идеально подходит для использования в формах, модальных окнах и любых UI-элементах, требующих ввода даты. Компонент становится контролируемым при установке свойства `value`. Если это значение не задано, компонент используется в неконтролируемом режиме. В этом случае задать начальное состояние можно через дополнительное свойство `defaultValue`. По умолчанию `DatePicker` — неконтролируемый компонент.

### Полезная рекомендация

Для установки дат в правильном формате может понадобиться подключение вспомогательных функций из [библиотеки Date Utils](https://gravity-ui.com/libraries/date-utils).

```tsx
import {dateTimeParse, dateTime} from '@gravity-ui/date-utils';
```

## Внешний вид

Внешний вид `DatePicker` можно настроить с помощью свойств `size`, `view` и `pin`.

### Размер

Для изменения размера `DatePicker` используйте свойство `size`. Размер по умолчанию — `m`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DatePicker size="s" />
<DatePicker size="m" />
<DatePicker size="l" />
<DatePicker size="xl" />
`}
>
    <DateComponents.DatePicker size="s" />
    <DateComponents.DatePicker size="m" />
    <DateComponents.DatePicker size="l" />
    <DateComponents.DatePicker size="xl" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DatePicker size="s" />
<DatePicker size="m" />
<DatePicker size="l" />
<DatePicker size="xl" />
```

<!--/GITHUB_BLOCK-->

### `View` (вид)

`normal` — основной вид `DatePicker` (используется по умолчанию).

<!--LANDING_BLOCK
<ExampleBlock code={`<DatePicker />`}>
    <DateComponents.DatePicker />
</ExampleBlock>
LANDING_BLOCK-->

`clear` — вид `DatePicker` без видимых границ (может использоваться с пользовательской оберткой).

<!--LANDING_BLOCK
<ExampleBlock code={`<DatePicker view="clear" />`}>
    <DateComponents.DatePicker view="clear" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DatePicker view="normal" />
<DatePicker view="clear" />
```

<!--/GITHUB_BLOCK-->

### `Pin` (форматирование краев)

Свойство `pin` позволяет настраивать форму правого и левого краев элемента и обычно используется для объединения нескольких контролов в единый блок.
Значение свойства `pin` формируется из названий стилей левого и правого краев, разделенных дефисом, например, `"round-brick"`.
Доступные стили краев: `round` (по умолчанию), `circle`, `brick` и `clear`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DatePicker pin="round-brick" />
<DatePicker pin="brick-brick" />
<DatePicker pin="brick-round" />
`}
>
    <DateComponents.DatePicker pin="round-brick" />
    <DateComponents.DatePicker pin="brick-brick" />
    <DateComponents.DatePicker pin="brick-round" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DatePicker pin="round-brick" />
<DatePicker pin="brick-brick" />
<DatePicker pin="brick-round" />
```

<!--/GITHUB_BLOCK-->

## Значение

### Минимальное и максимальное значения

Свойство `minValue` позволяет задать наиболее ранние дату и время, которые может ввести пользователь. Свойство `maxValue`, в свою очередь, определяет наиболее поздние дату и время, которые доступны для ввода. Если введенное значение выходит за эти пределы, компонент меняет свой вид, сигнализируя об ошибке валидации.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DatePicker minValue={dateTimeParse('01.01.2024')} placeholder={"minValue: '01.01.2024'"}/>
<DatePicker maxValue={dateTimeParse('01.01.2025')} placeholder={"maxValue: '01.01.2025'"}/>
`}
>
    <DateComponentsExamples.DatePickerExample minValue={'01.01.2024'} placeholder={"minValue: '01.01.2024'"} />
    <DateComponentsExamples.DatePickerExample maxValue={'01.01.2025'} placeholder={"maxValue: '01.01.2025'"} />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx

<DatePicker minValue={dateTimeParse('01.01.2024')} />
<DatePicker maxValue={dateTimeParse('01.01.2025')} />
```

<!--/GITHUB_BLOCK-->

## Состояния

### `Disabled` (отключен)

Состояние `DatePicker`, при котором пользователь не может взаимодействовать с компонентом.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DatePicker disabled={true} defaultValue={dateTime()} />
`}
>
    <DateComponentsExamples.DatePickerExample disabled={true} defaultValue={new Date()} />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DatePicker disabled defaultValue={dateTime()} />
```

<!--/GITHUB_BLOCK-->

### `readOnly` (только для чтения)

`readOnly` — это булев атрибут, который при установке в `true` делает компонент `DatePicker` недоступным для редактирования пользователем. Это означает, что пользователи видят текущее значение поля, но не могут его изменить.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DatePicker readOnly defaultValue={dateTimeParse(new Date())} />
`}
>
    <DateComponentsExamples.DatePickerExample readOnly defaultValue={new Date()} />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DatePicker readOnly defaultValue={dateTime()} />
```

<!--/GITHUB_BLOCK-->

### `Error` (ошибка)

Состояние `DatePicker`, которое указывает на некорректный ввод данных пользователем. Для изменения внешнего представления `DatePicker` примените свойство `validationState`, задав ему значение `"invalid"`. Дополнительно через свойство `errorMessage` можно добавить текст сообщения, который будет отображаться под компонентом.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DatePicker errorMessage="Error message" validationState="invalid" />
<DatePicker validationState="invalid" />
`}
>
    <DateComponents.DatePicker errorMessage="Error message" validationState="invalid" />
    <DateComponents.DatePicker validationState="invalid" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DatePicker errorMessage="Error message" validationState="invalid" />
<DatePicker validationState="invalid" />
```

<!--/GITHUB_BLOCK-->

## Дополнительные свойства

### `Placeholder` (заглушка)

С помощью этого свойства можно задать короткую подсказку, описывающую ожидаемое значение для поля ввода. Подсказка отображается в поле до начала ввода и исчезает, когда пользователь начинает вводить текст.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DatePicker placeholder="Placeholder" />
`}
>
    <DateComponents.DatePicker placeholder='Placeholder' />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DatePicker placeholder="Placeholder" />
```

<!--/GITHUB_BLOCK-->

### `Label` (лейбл)

Данное свойство позволяет разместить лейбл в левой части поля. Лейбл может занимать не более половины ширины всего пространства `DatePicker`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DatePicker label="Label" />
<DatePicker label="Very long label with huge amount of symbols" />
`}
>
    <DateComponents.DatePicker label="Label" />
    <DateComponents.DatePicker label="Very long label with huge amount of symbols" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DatePicker label="Label" />
```

<!--/GITHUB_BLOCK-->

### `Clear button` (кнопка очистки)

`hasClear` — это булево свойство, позволяющее пользователям быстро очищать содержимое поля ввода.

<!--LANDING_BLOCK
<ExampleBlock
    code={`<DatePicker hasClear />`}
>
    <DateComponents.DatePicker
        hasClear
    />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DatePicker hasClear />
```

<!--/GITHUB_BLOCK-->

## Формат

Свойство `format` — это строка, задающая формат даты и времени, который компонент `DatePicker` будет принимать и отображать. Оно определяет, как дата и время отображаются для пользователя и в каком формате пользователь должен вводить данные. С доступными форматами можно ознакомиться по [этой ссылке](https://day.js.org/docs/en/display/format).

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DatePicker format='LL' />
`}
>
    <DateComponents.DatePicker format='LL' />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DatePicker format="LL" />
```

<!--/GITHUB_BLOCK-->

## Часовой пояс

`timeZone` — это свойство, позволяющее задать часовой пояс для значения в поле ввода. Подробнее о часовых поясах см. [здесь](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List).

## Кастомизация

Можно использовать собственный компонент календаря внутри `DatePicker`, передав его как `children` с теми же свойствами, что и у стандартного календаря.

<!--LANDING_BLOCK
[Learn more about calendar](https://gravity-ui.com/components/date-components/calendar)
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

Подробнее о компоненте `Calendar` см. [здесь](https://github.com/gravity-ui/date-components/blob/main/src/components/Calendar/README.md).

<!--/GITHUB_BLOCK-->

## Свойства

| Имя                           | Описание                                                                                                                                |                     Тип                      |          Значение по умолчанию          |
| :----------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------: | :-----------------------: |
| aria-describedby               | Атрибут `aria-describedby` для контрола. Определяет элемент или элементы, содержащие описание объекта.                                |                   `string`                    |                           |
| aria-details                   | Атрибут `aria-details` для контрола. Определяет элемент или элементы, содержащие подробное описание объекта. |                   `string`                    |                           |
| aria-label                     | Атрибут `aria-label` для контрола. Определяет строковое значение, используемое в качестве метки для текущего элемента.                                              |                   `string`                    |                           |
| aria-labelledby                | Атрибут `aria-labelledby` для контрола. Определяет элемент или элементы, используемые в качестве метки для текущего элемента.                           |                   `string`                    |                           |
| autoFocus                      | Атрибут `autofocus` для контрола. Определяет, должен ли элемент получать фокус при рендеринге.                                                   |                   `boolean`                   |                           |
| className                      | Имя класса обертки контрола.                                                                                                           |                   `string`                    |                           |
| [defaultValue](#datepicker)    | Задает начальное значение для неконтролируемого компонента.                                                                                         |                  `DateTime`                   |                           |
| [disabled](#disabled)          | Указывает на то, что пользователь не может взаимодействовать с контролом.                                                                                   |                   `boolean`                   |          `false`          |
| [errorMessage](#error)         | Текст ошибки.                                                                                                                                 |                  `ReactNode`                  |                           |
| [format](#format)              | Формат отображения даты в поле ввода. С доступными форматами можно ознакомиться по [этой ссылке](https://day.js.org/docs/en/display/format).                              |                   `string`                    |                           |
| [hasClear](#clear-button)      | Отображает иконку для очистки значения контрола.                                                                                                |                   `boolean`                   |          `false`          |
| id                             | Атрибут `id` для контрола.                                                                                                               |                   `string`                    |                           |
| isDateUnavailable              | Функция обратного вызова для каждой даты в календаре. Если она возвращает `true`, дата недоступна для выбора.                                   |        `((date: DateTime) => boolean)`        |                           |
| [label](#label)                | Текст подсказки (лейбл), отображаемый слева от поля ввода.                                                                                           |                   `string`                    |                           |
| [maxValue](#min-and-max-value) | Верхний предел выбора даты.                                                                                           |                  `DateTime`                   |                           |
| [minValue](#min-and-max-value) | Нижний предел выбора даты.                                                                                           |                  `DateTime`                   |                           |
| onBlur                         | Срабатывает, когда контрол теряет фокус. Передает событие фокуса в качестве аргумента обратного вызова.                                                           | `((e: FocusEvent<Element, Element>) => void)` |                           |
| onFocus                        | Срабатывает, когда контрол получает фокус. Передает событие фокуса в качестве аргумента обратного вызова.                                                           | `((e: FocusEvent<Element, Element>) => void)` |                           |
| onKeyDown                      | Срабатывает при нажатии клавиши. Передает событие клавиатуры в качестве аргумента обратного вызова.                                                              |    `((e: KeyboardEvent<Element>) => void)`    |                           |
| onKeyUp                        | Срабатывает при отпускании клавиши. Передает событие клавиатуры в качестве аргумента обратного вызова.                                                             |    `((e: KeyboardEvent<Element>) => void)`    |                           |
| onUpdate                       | Срабатывает, когда пользователь изменяет значение. Передает новое значение в качестве аргумента обратного вызова.                                                  |     `((value: DateTime \| null) => void`      |                           |
| [pin](#pin)                    | Скругление углов.                                                                                                                            |                `TextInputPin`                 |      `'round-round'`      |
| [placeholder](#placeholder)    | Текст, который отображается в контроле, когда его значение не задано.                                                                                  |                   `string`                    |                           |
| placeholderValue               | Дата-заполнитель, которая определяет начальное состояние (значение по умолчанию) для каждого сегмента календаря при первом его открытии пользователем.                               |                  `DateTime`                   | `today's date at midnigh` |
| [readOnly](#readonly)          | Определяет, можно ли изменять значение компонента.                                                                                                |                   `boolean`                   |          `false`          |
| [size](#size)                  | Размер контрола.                                                                                                                    |           `"s"` `"m"` `"l"` `"xl"`            |           `"m"`           |
| style                          | Задает инлайн-стиль для элемента.                                                                                                         |                `CSSProperties`                |                           |
| [timeZone](#time-zone)         | Задает часовой пояс. Подробнее о часовых поясах см. [здесь](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List).                       |                   `string`                    |                           |
| [validationState](#error)      | Состояние валидации.                                                                                                                           |                  `"invalid"`                  |                           |
| [value](#datepicker)           | Значение контрола.                                                                                                                   |               `DateTime` `null`               |                           |
| [view](#view)                  | Вид контрола.                                                                                                                    |             `"normal"` `"clear"`              |        `"normal"`         |