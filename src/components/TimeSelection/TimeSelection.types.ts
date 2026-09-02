import type {DateTime} from '@gravity-ui/date-utils';

export type TimeSelectionView = 'hours' | 'minutes' | 'seconds';
export type TimeSelectionWheel = TimeSelectionView | 'ampm';

export interface TimeSelectionProps {
    /** Использовать 12-часовой формат с AM/PM */
    ampm?: boolean;
    /** Секция в фокусе по умолчанию */
    defaultFocusView?: TimeSelectionView;
    /** Значение по умолчанию для неконтролируемого режима */
    defaultValue?: DateTime;
    /** Отключить компонент */
    disabled?: boolean;
    /** Контролируемая секция в фокусе */
    focusedView?: TimeSelectionView;
    /** Функция для определения недоступных значений времени */
    isTimeDisabled?: (value: DateTime, view: TimeSelectionView) => boolean;
    /** Callback при изменении фокуса */
    onFocusViewUpdate?: (value: TimeSelectionView) => void;
    /** Callback при изменении значения */
    onUpdate?: (value: DateTime) => void;
    /** Минимальное доступное значение */
    minValue?: DateTime;
    /** Максимальное доступное значение */
    maxValue?: DateTime;
    /** Режим только для чтения */
    readOnly?: boolean;
    /** Шаги для каждой секции времени */
    timeSteps?: Partial<Record<TimeSelectionView, number>>;
    /** Часовой пояс */
    timeZone?: string;
    /** Контролируемое значение */
    value?: DateTime;
    /** Отображаемые секции */
    views?: TimeSelectionView[];
}

export interface WheelValue {
    label: string;
    value: string;
    disabled?: boolean;
}

export interface WheelProps {
    values: WheelValue[];
    value: string;
    setValue: (val: string) => void;
    isInfinite?: boolean;
    onChange?: (val: string) => void;
    isActive?: boolean;
    onActivate?: () => void;
    disabled?: boolean;
}
