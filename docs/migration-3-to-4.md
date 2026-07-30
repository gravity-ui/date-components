# Migration guide: 3.x → 4.x

This note summarizes the main behavior changes that are relevant for migration from version 3 to version 4.

## 1. RelativeDateField: `onUpdate` is now emitted only for valid input

### Before

The component could report intermediate values while the user was typing an incomplete or invalid relative expression.

```tsx
<RelativeDateField onUpdate={(value) => console.log(value)} />
```

Example flow:

- typing `now - 1` could already trigger `onUpdate('now - 1')`
- invalid draft text could still propagate while the input was being edited

### After

`onUpdate` is emitted only when the current input is valid.

```tsx
<RelativeDateField onUpdate={(value) => console.log(value)} />
```

Example flow:

- typing `now - 1` does not emit until the expression becomes valid
- invalid draft text is kept in the field, but the last committed value remains unchanged until the input becomes valid again

### What to change in your code

If your application relied on “live updates during typing”, move the logic to the moment when the value becomes valid.

```tsx
// Before
const handleUpdate = (value) => {
  setState(value);
};

// After
const handleUpdate = (value) => {
  if (value !== null) {
    setState(value);
  }
};
```

## 2. DateField / RangeDateField: intermediate invalid dates are now preserved instead of immediately emitting

### Before

While the user was typing, an incomplete or invalid date could be forced through the update flow quickly, and the component could emit values before the input was finalized.

```tsx
<DateField onUpdate={(value) => console.log(value)} />
```

### After

The component temporarily preserves invalid or incomplete input internally and does not emit `onUpdate` until the value is finalized on blur.

```tsx
<DateField onUpdate={(value) => console.log(value)} />
```

Example flow:

- typing `31 April 2024` keeps the field in an intermediate state
- the value is normalized only when the field loses focus

### What to change in your code

If your consumer expects “instant updates on every keystroke”, switch to a blur-based or validation-based flow.

```tsx
// Before
const handleUpdate = (value) => {
  saveValue(value);
};

// After
const handleBlur = () => {
  if (currentValueRef.current) {
    saveValue(currentValueRef.current);
  }
};
```

## 3. Calendar selection styling changed

### Before

The visual treatment of the selection end text color was different.

### After

The end of the selection uses updated text color styling.

### What to change in your code

If you use custom CSS overrides for calendar selection visuals, review those styles after upgrading.

## 4. Additional behavior changes worth checking

- Calendar now supports multi-selection.
- RelativeRangeDatePicker accepts `null` values in preset handling.
- DateField internals were refactored around incomplete/invalid state handling.

## Migration checklist

- Review handlers that depend on `onUpdate` during typing.
- Make sure your form logic handles “invalid/incomplete intermediate input” without assuming it is committed.
- Check custom styles for calendar selection visuals.
- Re-test date entry flows for blur and validation behavior.
