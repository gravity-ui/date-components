<!--GITHUB_BLOCK-->

# DateField

<!--/GITHUB_BLOCK-->

```tsx
import {DateField} from '@gravity-ui/date-components';
```

Компонент `DateField` — это универсальное и удобное поле ввода, специально созданное для работы с датами в React-приложениях. Благодаря интуитивно понятному интерфейсу и простой интеграции `DateField` идеально подходит для форм, требующих ввода даты или времени, например, планировщиков событий, систем бронирования или отчетов на основе данных. Компонент становится контролируемым при установке свойства `value`. Если это значение не задано, компонент используется в неконтролируемом режиме. В этом случае задать начальное состояние можно через дополнительное свойство `defaultValue`. По умолчанию `DateField` — неконтролируемый компонент.

### Полезная рекомендация

Для установки дат в правильном формате может понадобиться подключение вспомогательных функций из [библиотеки Date Utils](https://gravity-ui.com/libraries/date-utils).

```tsx
import {dateTimeParse} from '@gravity-ui/date-utils';
```

## Внешний вид

Внешний вид `DateField` можно настроить с помощью свойств `size`, `view` и `pin`.

### `Size` (размер)

Для изменения размера `DateField` используйте свойство `size`. Размер по умолчанию — `m`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DateField size="s" />
<DateField size="m" />
<DateField size="l" />
<DateField size="xl" />
`}
>
    <DateComponents.DateField size="s" />
    <DateComponents.DateField size="m" />
    <DateComponents.DateField size="l" />
    <DateComponents.DateField size="xl" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DateField size="s" />
<DateField size="m" />
<DateField size="l" />
<DateField size="xl" />
```

<!--/GITHUB_BLOCK-->

### `View` (вид)

`normal` — основной вид `DateField` (используется по умолчанию).

<!--LANDING_BLOCK
<ExampleBlock code={`<DateField />`}>
    <DateComponents.DateField />
</ExampleBlock>
LANDING_BLOCK-->

`clear` — вид `DateField` без видимых границ (может использоваться с пользовательской оберткой).

<!--LANDING_BLOCK
<ExampleBlock code={`<DateField view="clear" />`}>
    <DateComponents.DateField view="clear" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DateField view="normal" />
<DateField view="clear" />
```

<!--/GITHUB_BLOCK-->

### `Pin` (форматирование краев)

Свойство `pin` позволяет настраивать форму правого и левого краев элемента и обычно используется для объединения нескольких контролов в единый блок.
Значение свойства `pin` формируется из названий стилей левого и правого краев, разделенных дефисом, например, `"round-brick"`.
Доступные стили краев: `round` (по умолчанию), `circle`, `brick` и `clear`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DateField pin="round-brick" />
<DateField pin="brick-brick" />
<DateField pin="brick-round" />
`}
>
    <DateComponents.DateField pin="round-brick" />
    <DateComponents.DateField pin="brick-brick" />
    <DateComponents.DateField pin="brick-round" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DateField pin="round-brick" />
<DateField pin="brick-brick" />
<DateField pin="brick-round" />
```

<!--/GITHUB_BLOCK-->

## Значение

### Минимальное и максимальное значения

Свойство `minValue` позволяет задать наиболее ранние дату и время, которые может ввести пользователь. Свойство `maxValue`, в свою очередь, определяет наиболее поздние дату и время, которые доступны для ввода. Если введенное значение выходит за эти пределы, компонент меняет свой вид, сигнализируя об ошибке валидации.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DateField minValue={dateTimeParse('01.01.2024')} placeholder={"minValue: '01.01.2024'"}/>
<DateField maxValue={dateTimeParse('01.01.2025')} placeholder={"maxValue: '01.01.2025'"}/>
`}
>
    <DateComponentsExamples.DateFieldExample minValue={'01.01.2024'} placeholder={"minValue: '01.01.2024'"} />
    <DateComponentsExamples.DateFieldExample maxValue={'01.01.2025'} placeholder={"maxValue: '01.01.2025'"} />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx

<DateField minValue={dateTimeParse('01.01.2024')} />
<DateField maxValue={dateTimeParse('01.01.2025')} />
```

<!--/GITHUB_BLOCK-->

## Состояния

### `Disabled` (отключен)

Состояние `DateField`, при котором пользователь не может взаимодействовать с компонентом.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DateField disabled={true} defaultValue={dateTimeParse(new Date())} />
`}
>
    <DateComponentsExamples.DateFieldExample disabled={true} defaultValue={new Date()} />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DateField disabled defaultValue={dateTimeParse(new Date())} />
```

<!--/GITHUB_BLOCK-->

### `readOnly` (только для чтения)

`readOnly` — это булев атрибут, который при установке в `true` делает компонент `DateField` недоступным для редактирования пользователем. Это означает, что пользователи видят текущее значение поля, но не могут его изменить.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DateField readOnly defaultValue={dateTimeParse(new Date())} />
`}
>
    <DateComponentsExamples.DateFieldExample readOnly defaultValue={new Date()} />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DateField readOnly defaultValue={dateTimeParse(new Date())} />
```

<!--/GITHUB_BLOCK-->

### `Error` (ошибка)

Состояние `DateField`, которое указывает на некорректный ввод данных пользователем. Для изменения внешнего представления `DateField` примените свойство `validationState`, задав ему значение `"invalid"`. Дополнительно через свойство `errorMessage` можно добавить текст сообщения, который будет отображаться под компонентом.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DateField errorMessage="Error message" validationState="invalid" />
<DateField validationState="invalid" />
`}
>
    <DateComponents.DateField errorMessage="Error message" validationState="invalid" />
    <DateComponents.DateField validationState="invalid" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DateField errorMessage="Error message" validationState="invalid" />
<DateField validationState="invalid" />
```

<!--/GITHUB_BLOCK-->

## Дополнительные свойства

### `Placeholder` (заглушка)

С помощью этого свойства можно задать короткую подсказку, описывающую ожидаемое значение для поля ввода. Подсказка отображается в поле до начала ввода и исчезает, когда пользователь начинает вводить текст.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DateField placeholder='Placeholder' />
`}
>
    <DateComponents.DateField placeholder='Placeholder' />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DateField placeholder="Placeholder" />
```

<!--/GITHUB_BLOCK-->

### `Label` (лейбл)

Данное свойство позволяет разместить лейбл в левой части поля. Лейбл может занимать не более половины ширины всего пространства `DateField`.

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DateField label="Label" />
<DateField label="Very long label with huge amount of symbols" />
`}
>
    <DateComponents.DateField label="Label" />
    <DateComponents.DateField label="Very long label with huge amount of symbols" />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DateField label="Label" />
```

<!--/GITHUB_BLOCK-->

### `Clear button` (кнопка очистки)

`hasClear` — это булево свойство, позволяющее пользователям быстро очищать содержимое поля ввода.

<!--LANDING_BLOCK
<ExampleBlock
    code={`<DateField hasClear />`}
>
    <DateComponents.DateField
        hasClear
    />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DateField hasClear />
```

<!--/GITHUB_BLOCK-->

### `Start content` (контент в начале поля)

Позволяет добавить контент в начало поля. Он помещается перед остальными компонентами.

<!--LANDING_BLOCK
<ExampleBlock
    code={`<DateField label="Label" startContent={<Label size="s">Start content</Label>} />`}
>
    <DateComponents.DateField
        label="Label"
        startContent={<UIKit.Label size="s">Start content</UIKit.Label>}
    />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DateField label="Label" startContent={<Label>Start content</Label>} />
```

<!--/GITHUB_BLOCK-->

### `End content` (контент в конце поля)

Позволяет добавить контент в конце поля. Он помещается после остальных компонентов.

<!--LANDING_BLOCK
<ExampleBlock
    code={`<DateField endContent={<Label size="s">End content</Label>} hasClear/>`}
>
    <DateComponents.DateField
        hasClear
        endContent={<UIKit.Label size="s">End content</UIKit.Label>}
    />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DateField hasClear endContent={<Label>End content</Label>} />
```

<!--/GITHUB_BLOCK-->

## Формат

Свойство `format` — это строка, задающая формат даты и времени, который компонент `DateField` будет принимать и отображать. Оно определяет, как дата и время отображаются для пользователя и в каком формате пользователь должен вводить данные. С доступными форматами можно ознакомиться по [этой ссылке](https://day.js.org/docs/en/display/format).

<!--LANDING_BLOCK
<ExampleBlock
    code={`
<DateField format='LTS' />
`}
>
    <DateComponents.DateField format='LTS' />
</ExampleBlock>
LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

```tsx
<DateField format="LTS" />
```

<!--/GITHUB_BLOCK-->

## Часовой пояс

`timeZone` — это свойство, позволяющее задать часовой пояс для значения в поле ввода. Подробнее о часовых поясах см. [здесь](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List).

## Свойства

| Имя               | Описание                                                                                                                                               |                      Тип                      |   Значение по умолчанию   |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------: | :-----------------------: |
| aria-describedby  | Атрибут `aria-describedby` для контрола.                                                                                                               |                   `string`                    |                           |
| aria-details      | Атрибут `aria-details` для контрола.                                                                                                                   |                   `string`                    |                           |
| aria-label        | Атрибут `aria-label` для контрола.                                                                                                                     |                   `string`                    |                           |
| aria-labelledby   | Атрибут `aria-labelledby` для контрола.                                                                                                                |                   `string`                    |                           |
| autoFocus         | Атрибут `autofocus` для контрола.                                                                                                                      |                   `boolean`                   |                           |
| className         | Имя класса обертки контрола.                                                                                                                           |                   `string`                    |                           |
| defaultValue      | Задает начальное значение для неконтролируемого компонента.                                                                                            |                  `DateTime`                   |                           |
| disabled          | Указывает на то, что пользователь не может взаимодействовать с контролом.                                                                              |                   `boolean`                   |          `false`          |
| errorMessage      | Текст ошибки.                                                                                                                                          |                  `ReactNode`                  |                           |
| format            | Формат отображения даты в поле ввода. С доступными форматами можно ознакомиться по [этой ссылке](https://day.js.org/docs/en/display/format).           |                   `string`                    |                           |
| hasClear          | Отображает иконку для очистки значения контрола.                                                                                                       |                   `boolean`                   |          `false`          |
| id                | Атрибут `id` для контрола.                                                                                                                             |                   `string`                    |                           |
| isDateUnavailable | Функция обратного вызова для каждой даты в календаре. Если она возвращает `true`, дата недоступна для выбора.                                          |        `((date: DateTime) => boolean)`        |                           |
| label             | Текст подсказки (лэйбл), отображаемый слева от поля ввода.                                                                                             |                   `string`                    |                           |
| startContent      | Пользовательский контент, отображаемый перед лэйблом и полем ввода.                                                                                    |               `React.ReactNode`               |                           |
| maxValue          | Верхний предел выбора даты.                                                                                                                            |                  `DateTime`                   |                           |
| minValue          | Нижний предел выбора даты.                                                                                                                             |                  `DateTime`                   |                           |
| onBlur            | Срабатывает, когда контрол теряет фокус. Передает событие фокуса в качестве аргумента обратного вызова.                                                | `((e: FocusEvent<Element, Element>) => void)` |                           |
| onFocus           | Срабатывает, когда контрол получает фокус. Передает событие фокуса в качестве аргумента обратного вызова.                                              | `((e: FocusEvent<Element, Element>) => void)` |                           |
| onKeyDown         | Срабатывает при нажатии клавиши. Передает событие клавиатуры в качестве аргумента обратного вызова.                                                    |    `((e: KeyboardEvent<Element>) => void)`    |                           |
| onKeyUp           | Срабатывает при отпускании клавиши. Передает событие клавиатуры в качестве аргумента обратного вызова.                                                 |    `((e: KeyboardEvent<Element>) => void)`    |                           |
| onUpdate          | Срабатывает, когда пользователь изменяет значение. Передает новое значение в качестве аргумента обратного вызова.                                      |     `((value: DateTime \| null) => void`      |                           |
| pin               | Скругление углов.                                                                                                                                      |                   `string`                    |      `'round-round'`      |
| placeholder       | Текст, который отображается в контроле, когда его значение не задано.                                                                                  |                   `string`                    |                           |
| placeholderValue  | Дата-заполнитель, которая определяет начальное состояние (значение по умолчанию) для каждого сегмента календаря при первом его открытии пользователем. |                  `DateTime`                   | `today's date at midnigh` |
| readOnly          | Определяет, можно ли изменять значение компонента.                                                                                                     |                   `boolean`                   |          `false`          |
| endContent        | Пользовательский контент, отображаемый после поля ввода и кнопки очистки.                                                                              |               `React.ReactNode`               |                           |
| size              | Размер контрола.                                                                                                                                       |           `"s"` `"m"` `"l"` `"xl"`            |           `"m"`           |
| style             | Задает инлайн-стиль для элемента.                                                                                                                      |                `CSSProperties`                |                           |
| timeZone          | Задает часовой пояс. Подробнее о часовых поясах см. [здесь](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List).                        |                   `string`                    |                           |
| validationState   | Состояние валидации.                                                                                                                                   |                  `"invalid"`                  |                           |
| value             | Значение контрола.                                                                                                                                     |               `DateTime` `null`               |                           |
| view              | Вид контрола.                                                                                                                                          |             `"normal"` `"clear"`              |        `"normal"`         |
