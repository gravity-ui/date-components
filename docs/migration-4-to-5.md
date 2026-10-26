# Migration guide: 4.x → 5.x

Version 5 moves `@gravity-ui/date-components` to `@gravity-ui/uikit` v8. Most of the changes come from uikit itself: upgrade your application with the [uikit v8 migration guide](https://github.com/gravity-ui/uikit/blob/main/docs/migration-to-v8.md) first, then go through the sections below. They cover only what changes for code that uses date components.

## 1. Peer dependencies

| Package                   | 4.x        | 5.x                    |
| :------------------------ | :--------- | :--------------------- |
| `@gravity-ui/uikit`       | `^7.21.0`  | `^8.0.0`               |
| `react`, `react-dom`      | `>=17.0.0` | `^18.0.0 \|\| ^19.0.0` |
| `@types/react` (optional) | `>=17.0.0` | `^18.0.0 \|\| ^19.0.0` |
| `@tanstack/react-virtual` | —          | `^3.13.0`              |

- **uikit v7 is not supported.** Date components and uikit have to be upgraded together.
- **React 17 is not supported**, as in uikit v8.
- **`@tanstack/react-virtual` is a new required peer dependency.** The timezone list of `RelativeRangeDatePicker` is virtualized with `ListVirtualizer` from `@gravity-ui/uikit/virtualizer`, which needs this package. The import is part of the package entry point, so without the package any import of `@gravity-ui/date-components` fails, even if you do not render `RelativeRangeDatePicker`: the bundler cannot resolve it, and in Node (Jest, server-side rendering) `require` throws `MODULE_NOT_FOUND`. npm 7+ and pnpm install peer dependencies automatically; with Yarn, add it yourself.
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

Move `lang` (and `fallbackLang`) from `ThemeProvider` to `Provider` or `LangProvider`. TypeScript reports a leftover `lang` on `ThemeProvider`. Plain JavaScript ignores it, and the components fall back to the language set with `configure()` from `@gravity-ui/uikit`, which is English unless you change it.

Loading date locales does not change: call `settings.loadLocale()` from `@gravity-ui/date-utils` before switching the language.

## 3. Removed `hasDate` and `hasTime` from the picker state

The `DatePickerState` and `RangeDatePickerState` types no longer have the deprecated `hasDate` and `hasTime` fields. Both were deprecated in favor of `formatInfo`. This applies to the state returned by `useDatePickerState` and `useRangeDatePickerState`, and to `datePickerState` in the state of `useRelativeDatePickerState`.

```diff
  const state = useDatePickerState(props);
- if (state.hasTime) {
+ if (state.formatInfo.hasTime) {
```

## 4. Props hooks return uikit v8 prop types

The hooks that build props for uikit components are typed with the uikit v8 types, and the props they return follow the v8 APIs:

| Hook                         | Returns                                                                |
| :--------------------------- | :--------------------------------------------------------------------- |
| `useDatePickerProps`         | `fieldProps`, `calendarButtonProps`, `popupProps`                      |
| `useRelativeDatePickerProps` | `fieldProps`, `modeSwitcherProps`, `calendarButtonProps`, `popupProps` |
| `useRelativeDateFieldProps`  | `inputProps`, `popupProps`                                             |
| `useDateFieldProps`          | `inputProps`                                                           |
| `useCalendarProps`           | the props of the header buttons                                        |

- `popupProps` no longer has `onEscapeKeyDown` and `onOutsideClick`: dismissal comes through `onOpenChange(open, event, reason)` with `reason` `'escape-key'` or `'outside-press'`. `PopupProps` in v8 also has no `anchorRef` and `onClose`.
- `TextInputProps` has no `error` and `onKeyPress`, and `ButtonButtonProps` has no `extraProps`.

If you spread these props onto your own uikit components, nothing changes. If you read or wrap individual callbacks, move to `onOpenChange`.

## 5. RelativeRangeDatePicker

### Presets list

The list of presets uses the new uikit [`List`](https://github.com/gravity-ui/uikit/blob/main/src/components/List/README.md) and looks different.

### Timezone list

The options of the timezone list (`withZonesList`) look like the options of the uikit v8 `Select`. The list stays virtualized, which needs the `@tanstack/react-virtual` peer dependency, see [Peer dependencies](#1-peer-dependencies).

### Mobile

On mobile the picker opens in a `Sheet`. `onOpenChange(false)` is now called as soon as the sheet starts to close, not after the closing animation.

If you render `RelativeRangeDatePickerDialog` yourself:

- On mobile, `onClose` is called once, as soon as the sheet starts to close, and `onRemove` after the closing animation. In 4.x the sheet called `onClose('outside-press')` and `onRemove` after the closing animation on every way of closing, so applying a value called `onClose` twice: with `'apply'`, then with `'outside-press'`.
- The sheet is controlled by `open`: it closes only when you set `open` to `false` in `onClose`.
- `onClose` gets the real reason: `'escape-key'`, `'outside-press'`, `'swipe'` or `'navigation'` instead of `'outside-press'` for every dismissal. The type of the reason includes the `SheetOpenChangeReason` of uikit.

## 6. Pickers inside `Dialog` and `Modal`

A uikit v8 `Dialog` or `Modal` moves focus to its content once its opening transition ends, about 150ms after mount. In v7 it did this on mount. Focus that lands on a date component during the transition, for example from code or from a fast test, is taken by the dialog, and an open picker popup closes.

In tests, wait for the dialog before interacting with a picker inside it:

```tsx
const screen = await render(<DialogWithDatePicker />);

await expect.element(screen.getByRole('dialog')).toHaveFocus();

screen.getByRole('combobox').element().focus();
```

Alternatively, render the dialog with `disableTransition`: it then opens without the transition, and the focus moves on mount.

## 7. Visual changes

The components look slightly different because uikit v8 changes them:

- colors come from Themer v2 and shift slightly in every theme;
- the `:hover` styles of uikit components inside date components, such as buttons and list rows, apply only on devices that can hover. The hover styles of the calendar cells and of `RangeDateSelection` do not change;

Update your screenshot baselines after the upgrade, and check custom CSS that overrides uikit classes inside date components.

## Migration checklist

- Upgrade `@gravity-ui/uikit` to v8 with its migration guide, and React to 18 or 19.
- Install `@tanstack/react-virtual`.
- Move `lang` from `ThemeProvider` to `Provider` or `LangProvider`.
- Replace `state.hasDate` and `state.hasTime` with `state.formatInfo.hasDate` and `state.formatInfo.hasTime`.
- Move code that reads `onEscapeKeyDown` or `onOutsideClick` of `popupProps` from the props hooks to `onOpenChange`.
- If you render `RelativeRangeDatePickerDialog` yourself, check its `onClose` and `onRemove` handlers on mobile.
- Update CSS overrides of the presets list and the timezone list of `RelativeRangeDatePicker`.
- Update tests that open pickers inside a `Dialog`.
- Update screenshot baselines.
