# Migration guide: 4.x → 5.x

Version 5 moves `@gravity-ui/date-components` to `@gravity-ui/uikit` v8. Most of the changes come from uikit itself: upgrade your application with the [uikit v8 migration guide](https://github.com/gravity-ui/uikit/blob/main/docs/migration-to-v8.md) first, then go through the sections below. They cover only what changes for code that uses date components.

## 1. Peer dependencies

| Package                   | 4.x        | 5.x                    |
| :------------------------ | :--------- | :--------------------- |
| `@gravity-ui/uikit`       | `^7.21.0`  | `^8.0.0`               |
| `react`, `react-dom`      | `>=17.0.0` | `^18.0.0 \|\| ^19.0.0` |
| `@types/react` (optional) | `>=17.0.0` | `^18.0.0 \|\| ^19.0.0` |
| `@tanstack/react-virtual` | —          | `^3.0.0`               |

- **uikit v7 is not supported.** Date components and uikit have to be upgraded together.
- **React 17 is not supported**, as in uikit v8.
- **`@tanstack/react-virtual` is a new required peer dependency.** The timezone list of `RelativeRangeDatePicker` is virtualized with `ListVirtualizer` from `@gravity-ui/uikit/virtualizer`, which needs this package. The import is part of the package entry point, so a bundler resolves it even if you do not render `RelativeRangeDatePicker`. npm 7+ and pnpm install peer dependencies automatically; with Yarn, add it yourself.
- **`@types/react` is optional now.** In 4.x it was meant to be optional, but a typo in `peerDependenciesMeta` made it required.
- **No other optional peers of uikit are needed.** Date components do not import `@gravity-ui/uikit/legacy`, so `@hello-pangea/dnd`, `react-window` and `react-virtualized-auto-sizer` are not required.

```shell
npm install @gravity-ui/date-components@5 @gravity-ui/uikit@8 @tanstack/react-virtual
```

## 2. Language is set on `Provider`

Date components take their language from the uikit providers. In uikit v8 `ThemeProvider` handles only the theme and the direction, and no longer accepts `lang`.

### Before

```tsx
import {ThemeProvider} from '@gravity-ui/uikit';

<ThemeProvider theme="light" lang="ru">
  <DatePicker />
</ThemeProvider>;
```

### After

```tsx
import {Provider} from '@gravity-ui/uikit';

<Provider theme="light" lang="ru">
  <DatePicker />
</Provider>;
```

To change only the language of a subtree, use `LangProvider` from `@gravity-ui/uikit`.

### What to change in your code

Move `lang` (and `fallbackLang`) from `ThemeProvider` to `Provider` or `LangProvider`. TypeScript reports a leftover `lang` on `ThemeProvider`. Plain JavaScript ignores it, and the components fall back to English: placeholders, month names and the texts of the pickers.

Loading date locales does not change: call `settings.loadLocale()` from `@gravity-ui/date-utils` before switching the language.

## 3. Removed `hasDate` and `hasTime` from the picker state

The state returned by `useDatePickerState` and `useRangeDatePickerState` no longer has the deprecated `hasDate` and `hasTime` fields. Both were deprecated in favor of `formatInfo`.

```diff
  const state = useDatePickerState(props);
- if (state.hasTime) {
+ if (state.formatInfo.hasTime) {
```

## 4. RelativeRangeDatePicker

### Presets list

The list of presets is built on the new uikit `List`.

- **Roles.** The list is a `listbox` and its rows are `option`s, named by the preset title. Tests that look for presets by text keep working. Tests that look for them by role should use `getByRole('option', {name: 'Last week'})`.
- **Keyboard.** The list is one tab stop. The arrows move between presets, `Enter` applies the active one, and typing the first letters of a title jumps to it.
- **CSS.** The `.g-list*` classes of the legacy list are no longer rendered, and neither are `.g-date-relative-range-date-picker-presets__item` and `.g-date-relative-range-date-picker-presets__list-container`. The rows are uikit `ListItemView`s. Restyle them with the [`ListItemView` CSS API](https://github.com/gravity-ui/uikit/blob/main/src/components/ListItemView/README.md#css-api) on `.g-date-relative-range-date-picker-presets__list`. The row heights stay as in 4.x: 28px for sizes `s` and `m`, 32px for `l` and 36px for `xl`.

### Docs table

The table of examples in the docs popover (`withHeader`) is a plain `<table>` instead of the uikit `Table`, which moved to `@gravity-ui/uikit/legacy`. It looks the same, but the `.g-table*` classes are gone. Use `.g-date-relative-range-date-picker-doc__table`, `__row` and `__cell` instead.

### Timezone list

The timezone `Select` (`withZonesList`) follows the uikit v8 `Select`:

- Its options are virtualized, as in 4.x, so only the visible rows are in the DOM.
- The rows look like the rows of the new `List`: they are rounded and 4px away from the edges of the popup.
- The popup opens 4px away from the control instead of 1px.
- The filter input is a `combobox`: in tests, find it with `getByRole('combobox')` inside the popup instead of `getByRole('textbox')`.
- Group headers (`Africa`, `America`, …) are no longer `option`s.

### Mobile

On mobile the picker opens in a `Sheet`. `onOpenChange(false)` is now called as soon as the sheet starts to close, not after the closing animation.

## 5. Pickers inside `Dialog` and `Modal`

A uikit v8 `Dialog` or `Modal` moves focus to its content once its opening transition ends, about 150ms after mount. In v7 it did this on mount. Focus that lands on a date component during the transition, for example from code or from a fast test, is taken by the dialog, and an open picker popup closes.

In tests, wait for the dialog before interacting with a picker inside it:

```tsx
const screen = await render(<DialogWithDatePicker />);

await expect.element(screen.getByRole('dialog')).toHaveFocus();

screen.getByRole('combobox').element().focus();
```

## 6. Visual changes

The components look slightly different because uikit v8 changes them:

- colors come from Themer v2 and shift slightly in every theme;
- `:hover` styles apply only on devices that can hover;
- the rows of the presets and timezone lists of `RelativeRangeDatePicker` change, see [section 4](#4-relativerangedatepicker).

Update your screenshot baselines after the upgrade, and check custom CSS that overrides uikit classes inside date components.

## Migration checklist

- Upgrade `@gravity-ui/uikit` to v8 with its migration guide, and React to 18 or 19.
- Install `@tanstack/react-virtual`.
- Move `lang` from `ThemeProvider` to `Provider` or `LangProvider`.
- Replace `state.hasDate` and `state.hasTime` with `state.formatInfo.hasDate` and `state.formatInfo.hasTime`.
- Update CSS overrides of the presets list, the docs table and the timezone list of `RelativeRangeDatePicker`.
- Update tests that query presets or the timezone filter by role, and tests that open pickers inside a `Dialog`.
- Update screenshot baselines.
