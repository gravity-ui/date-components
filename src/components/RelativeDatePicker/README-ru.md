<!--GITHUB_BLOCK-->

# RelativeDatePicker

<!--/GITHUB_BLOCK-->

```tsx
import {RelativeDatePicker} from '@gravity-ui/date-components';
```

`RelativeDatePicker` — компонент, аналогичный `DatePicker`, но с возможностью использования относительных дат.

## Отличие от `DatePicker`

`RelativeDatePicker` поддерживает два режима: `absolute` и `relative`. Режимы можно переключать между собой нажатием на кнопку `f(x)` или установкой поля `type` в объекте `value` или `defaultValue`

### Режим `absolute`

В режиме `absolute` `RelativeDatePicker` работает как `DatePicker`.

<!--LANDING_BLOCK

[Learn more about DatePicker](/components/date-components/date-picker)

LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

Подробнее о компоненте `DatePicker` см. [здесь](/src/components/DatePicker).

<!--/GITHUB_BLOCK-->

### Режим `relative`

В этом режиме `RelativeDatePicker` принимает и возвращает значения в специальном относительном формате.

<!--LANDING_BLOCK

[Learn more about rules of relative formulas](/components/date-components/relative-date-field#relative-input)

LANDING_BLOCK-->

<!--GITHUB_BLOCK-->

Подробнее о правилах создания относительных формул см. [здесь](/src/components/RelativeDateField#relative-input).

<!--/GITHUB_BLOCK-->

## Свойства

| Имя               | Описание                                                                                                                                               |                      Тип                      |   Значение по умолчанию   |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------: | :-----------------------: |
| aria-describedby  | Атрибут `aria-describedby` для контрола. Определяет элемент или элементы, содержащие описание объекта.                                                 |                   `string`                    |                           |
| aria-details      | Атрибут `aria-details` для контрола. Определяет элемент или элементы, содержащие подробное описание объекта.                                           |                   `string`                    |                           |
| aria-label        | Атрибут `aria-label` для контрола. Определяет строковое значение, используемое в качестве метки для текущего элемента.                                 |                   `string`                    |                           |
| aria-labelledby   | Атрибут `aria-labelledby` для контрола. Определяет элемент или элементы, используемые в качестве метки для текущего элемента.                          |                   `string`                    |                           |
| autoFocus         | Атрибут `autofocus` для контрола. Определяет, должен ли элемент получать фокус при рендеринге.                                                         |                   `boolean`                   |                           |
| className         | Имя класса обертки контрола.                                                                                                                           |                   `string`                    |                           |
| defaultValue      | Задает начальное значение для неконтролируемого компонента.                                                                                            |                    `Value`                    |                           |
| disabled          | Указывает на то, что пользователь не может взаимодействовать с контролом.                                                                              |                   `boolean`                   |          `false`          |
| errorMessage      | Текст ошибки.                                                                                                                                          |                  `ReactNode`                  |                           |
| format            | Формат отображения даты в поле ввода. С доступными форматами можно ознакомиться по [этой ссылке](https://day.js.org/docs/en/display/format).           |                   `string`                    |                           |
| hasClear          | Отображает иконку для очистки значения контрола.                                                                                                       |                   `boolean`                   |          `false`          |
| id                | Атрибут `id` для контрола.                                                                                                                             |                   `string`                    |                           |
| isDateUnavailable | Функция обратного вызова для каждой даты в календаре. Если она возвращает `true`, дата недоступна для выбора.                                          |        `((date: DateTime) => boolean)`        |                           |
| label             | Текст подсказки (лейбл), отображаемый слева от поля ввода.                                                                                             |                   `string`                    |                           |
| maxValue          | Верхний предел выбора даты.                                                                                                                            |                  `DateTime`                   |                           |
| minValue          | Нижний предел выбора даты.                                                                                                                             |                  `DateTime`                   |                           |
| onBlur            | Срабатывает, когда контрол теряет фокус. Передает событие фокуса в качестве аргумента обратного вызова.                                                | `((e: FocusEvent<Element, Element>) => void)` |                           |
| onFocus           | Срабатывает, когда контрол получает фокус. Передает событие фокуса в качестве аргумента обратного вызова.                                              | `((e: FocusEvent<Element, Element>) => void)` |                           |
| onKeyDown         | Срабатывает при нажатии клавиши. Передает событие клавиатуры в качестве аргумента обратного вызова.                                                    |    `((e: KeyboardEvent<Element>) => void)`    |                           |
| onKeyUp           | Срабатывает при отпускании клавиши. Передает событие клавиатуры в качестве аргумента обратного вызова.                                                 |    `((e: KeyboardEvent<Element>) => void)`    |                           |
| onUpdate          | Срабатывает, когда пользователь изменяет значение. Передает новое значение в качестве аргумента обратного вызова.                                      |       `((value: Value \| null) => void`       |                           |
| pin               | Скругление углов.                                                                                                                                      |                `TextInputPin`                 |      `'round-round'`      |
| placeholder       | Текст, который отображается в контроле, когда его значение не задано.                                                                                  |                   `string`                    |                           |
| placeholderValue  | Дата-заполнитель, которая определяет начальное состояние (значение по умолчанию) для каждого сегмента календаря при первом его открытии пользователем. |                  `DateTime`                   | `today's date at midnigh` |
| readOnly          | Определяет, можно ли изменять значение компонента.                                                                                                     |                   `boolean`                   |          `false`          |
| size              | Размер контрола.                                                                                                                                       |           `"s"` `"m"` `"l"` `"xl"`            |           `"m"`           |
| style             | Задает инлайн-стиль для элемента.                                                                                                                      |                `CSSProperties`                |                           |
| timeZone          | Задает часовой пояс. Подробнее о часовых поясах см. [здесь](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List).                        |                   `string`                    |                           |
| validationState   | Состояние валидации.                                                                                                                                   |                  `"invalid"`                  |                           |
| value             | Значение контрола.                                                                                                                                     |                `Value` `null`                 |                           |
| view              | Вид контрола.                                                                                                                                          |             `"normal"` `"clear"`              |        `"normal"`         |
