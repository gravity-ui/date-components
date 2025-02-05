import type {i18n as CalendarKeyset} from '../CalendarView/i18n';
import type {i18n as DateFieldKeyset} from '../DateField/i18n';
import type {i18n as DatePickerKeyset} from '../DatePicker/i18n';
import type {i18n as RangeDateSelectionKeyset} from '../RangeDateSelection/i18n';
import type {i18n as RelativeDatePickerKeyset} from '../RelativeDatePicker/i18n';
import type {i18n as RelativeRangeDatePickerControlKeyset} from '../RelativeRangeDatePicker/components/Control/i18n';
import type {i18n as RelativeRangeDatePickerFormKeyset} from '../RelativeRangeDatePicker/components/PickerDialog/i18n';
import type {i18n as RelativeRangeDatePickerPresetsKeyset} from '../RelativeRangeDatePicker/components/Presets/i18n';
import type {i18n as RelativeRangeDatePickerZonesKeyset} from '../RelativeRangeDatePicker/components/Zones/i18n';
import type {i18n as RelativeRangeDatePickerKeyset} from '../RelativeRangeDatePicker/i18n';
import type {i18n as ValidationKeyset} from '../utils/validation/i18n';

/* DeepPartial with depth limitation up to 9 */
type DeepPartial<T, N extends number = 9> = N extends 0
    ? T
    : Partial<{[P in keyof T]: DeepPartial<T[P], [never, 0, 1, 2, 3, 4, 5, 6, 7, 8][N]>}>;

export type Keysets = typeof CalendarKeyset.keysetData &
    typeof DateFieldKeyset.keysetData &
    typeof DatePickerKeyset.keysetData &
    typeof RangeDateSelectionKeyset.keysetData &
    typeof RelativeDatePickerKeyset.keysetData &
    typeof RelativeRangeDatePickerKeyset.keysetData &
    typeof RelativeRangeDatePickerFormKeyset.keysetData &
    typeof RelativeRangeDatePickerPresetsKeyset.keysetData &
    typeof RelativeRangeDatePickerZonesKeyset.keysetData &
    typeof RelativeRangeDatePickerControlKeyset.keysetData &
    typeof ValidationKeyset.keysetData;
export type PartialKeysets = DeepPartial<Keysets, 2>;
