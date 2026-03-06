import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {TimeSelection} from '../TimeSelection';
import type {TimeSelectionView} from '../TimeSelection.types';

const meta: Meta<typeof TimeSelection> = {
    title: 'Components/TimeSelection',
    component: TimeSelection,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        ampm: {
            control: 'boolean',
            description: 'Отображать ли AM/PM колонку для 12-часового формата',
            table: {
                defaultValue: {summary: 'false'},
            },
        },
        disabled: {
            control: 'boolean',
            description: 'Отключает выбор времени',
            table: {
                defaultValue: {summary: 'false'},
            },
        },
        readOnly: {
            control: 'boolean',
            description: 'Режим только для чтения',
            table: {
                defaultValue: {summary: 'false'},
            },
        },
        views: {
            control: 'inline-check',
            options: ['hours', 'minutes', 'seconds'],
            description: 'Какие секции времени отображать',
            table: {
                defaultValue: {summary: "['hours', 'minutes']"},
            },
        },
        defaultFocusView: {
            control: 'select',
            options: ['hours', 'minutes', 'seconds'],
            description: 'Секция, которая будет в фокусе по умолчанию',
        },
        timeZone: {
            control: 'text',
            description: 'Часовой пояс (например, "America/New_York")',
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TimeSelection>;

const Template = (args: any) => {
    const [value, setValue] = React.useState<DateTime>(dateTime());
    const [focusedView, setFocusedView] = React.useState<TimeSelectionView>(
        args.defaultFocusView || 'hours',
    );

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                padding: 20,
            }}
        >
            <TimeSelection
                {...args}
                value={value}
                onUpdate={setValue}
                focusedView={focusedView}
                onFocusViewUpdate={setFocusedView}
            />
            <div
                style={{
                    fontSize: 14,
                    color: 'var(--g-color-text-secondary)',
                    fontFamily: 'var(--g-text-body-font-family)',
                }}
            >
                Выбрано: <strong>{value.format(args.ampm ? 'hh:mm:ss A' : 'HH:mm:ss')}</strong>
            </div>
        </div>
    );
};

const ControlledTemplate = (args: any) => {
    const [value, setValue] = React.useState<DateTime>(dateTime().hour(14).minute(30).second(0));

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                padding: 20,
            }}
        >
            <TimeSelection {...args} value={value} onUpdate={setValue} />
            <div
                style={{
                    fontSize: 14,
                    color: 'var(--g-color-text-secondary)',
                    fontFamily: 'var(--g-text-body-font-family)',
                }}
            >
                <div>
                    Выбрано: <strong>{value.format('HH:mm:ss')}</strong>
                </div>
                <div style={{marginTop: 8}}>
                    <button
                        onClick={() => setValue(dateTime())}
                        style={{
                            padding: '6px 12px',
                            cursor: 'pointer',
                            borderRadius: 4,
                            border: '1px solid var(--g-color-line-generic)',
                            background: 'var(--g-color-base-background)',
                        }}
                    >
                        Сбросить на текущее время
                    </button>
                </div>
            </div>
        </div>
    );
};

const UncontrolledTemplate = (args: any) => {
    const [lastValue, setLastValue] = React.useState<DateTime | null>(null);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                padding: 20,
            }}
        >
            <TimeSelection
                {...args}
                defaultValue={dateTime().hour(10).minute(30)}
                onUpdate={setLastValue}
            />
            <div
                style={{
                    fontSize: 14,
                    color: 'var(--g-color-text-secondary)',
                    fontFamily: 'var(--g-text-body-font-family)',
                }}
            >
                {lastValue ? (
                    <div>
                        Последнее обновление: <strong>{lastValue.format('HH:mm:ss')}</strong>
                    </div>
                ) : (
                    <div>Выберите время</div>
                )}
            </div>
        </div>
    );
};

export const WithDefaultValue: Story = {
    render: (args: any) => {
        const [value, setValue] = React.useState<DateTime>(
            dateTime().hour(13).minute(37).second(12),
        );

        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    padding: 20,
                }}
            >
                <TimeSelection {...args} value={value} onUpdate={setValue} />
                <div
                    style={{
                        fontSize: 14,
                        color: 'var(--g-color-text-secondary)',
                        fontFamily: 'var(--g-text-body-font-family)',
                    }}
                >
                    <div>
                        Выбрано: <strong>{value.format('HH:mm:ss')}</strong>
                    </div>
                    <div style={{marginTop: 8}}>
                        <button
                            onClick={() => setValue(dateTime().hour(13).minute(37).second(12))}
                            style={{
                                padding: '6px 12px',
                                cursor: 'pointer',
                                borderRadius: 4,
                                border: '1px solid var(--g-color-line-generic)',
                                background: 'var(--g-color-base-background)',
                            }}
                        >
                            Сбросить на 13:37:12
                        </button>
                    </div>
                </div>
            </div>
        );
    },
    args: {
        views: ['hours', 'minutes', 'seconds'],
        timeSteps: {hours: 1, minutes: 1, seconds: 1},
    },
    parameters: {
        docs: {
            description: {
                story: 'Компонент с установленным начальным значением 13:37:12',
            },
        },
    },
};

export const Default: Story = {
    render: Template,
    args: {
        views: ['hours', 'minutes'],
        timeSteps: {hours: 1, minutes: 1, seconds: 1},
    },
};

export const WithAMPM: Story = {
    render: Template,
    args: {
        ampm: true,
        views: ['hours', 'minutes'],
        timeSteps: {hours: 1, minutes: 5, seconds: 1},
    },
};

export const WithSeconds: Story = {
    render: Template,
    args: {
        views: ['hours', 'minutes', 'seconds'],
        timeSteps: {hours: 1, minutes: 1, seconds: 1},
    },
};

export const CustomSteps: Story = {
    render: Template,
    args: {
        views: ['hours', 'minutes', 'seconds'],
        timeSteps: {hours: 2, minutes: 15, seconds: 30},
    },
    parameters: {
        docs: {
            description: {
                story: 'Компонент с кастомными шагами: часы - каждые 2 часа, минуты - каждые 15 минут, секунды - каждые 30 секунд',
            },
        },
    },
};

export const OnlyHours: Story = {
    render: Template,
    args: {
        views: ['hours'],
        ampm: true,
    },
};

export const OnlyMinutes: Story = {
    render: Template,
    args: {
        views: ['minutes'],
        timeSteps: {hours: 1, minutes: 5, seconds: 1},
    },
};

export const ReadOnly: Story = {
    render: Template,
    args: {
        readOnly: true,
        views: ['hours', 'minutes', 'seconds'],
    },
};

export const Disabled: Story = {
    render: Template,
    args: {
        disabled: true,
        views: ['hours', 'minutes'],
    },
};

export const WithMinMaxValues: Story = {
    render: (args: any) => {
        const [value, setValue] = React.useState<DateTime>(dateTime().hour(12).minute(0).second(0));
        const minValue = dateTime().hour(9).minute(0).second(0);
        const maxValue = dateTime().hour(18).minute(0).second(0);

        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    padding: 20,
                }}
            >
                <TimeSelection
                    {...args}
                    value={value}
                    onUpdate={setValue}
                    minValue={minValue}
                    maxValue={maxValue}
                />
                <div
                    style={{
                        fontSize: 14,
                        color: 'var(--g-color-text-secondary)',
                        fontFamily: 'var(--g-text-body-font-family)',
                    }}
                >
                    <div>
                        Выбрано: <strong>{value.format('HH:mm:ss')}</strong>
                    </div>
                    <div style={{marginTop: 8, fontSize: 12}}>
                        Доступный диапазон: {minValue.format('HH:mm')} - {maxValue.format('HH:mm')}
                    </div>
                </div>
            </div>
        );
    },
    args: {
        views: ['hours', 'minutes'],
        timeSteps: {hours: 1, minutes: 30, seconds: 1},
    },
};

export const WithCustomValidation: Story = {
    render: (args: any) => {
        const [value, setValue] = React.useState<DateTime>(dateTime().hour(10).minute(0));

        const isTimeDisabled = (val: DateTime, view: TimeSelectionView) => {
            if (view === 'hours') {
                return val.hour() === 12;
            }
            if (view === 'minutes') {
                const hour = val.hour();
                return hour === 12;
            }
            return false;
        };

        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    padding: 20,
                }}
            >
                <TimeSelection
                    {...args}
                    value={value}
                    onUpdate={setValue}
                    isTimeDisabled={isTimeDisabled}
                />
                <div
                    style={{
                        fontSize: 14,
                        color: 'var(--g-color-text-secondary)',
                        fontFamily: 'var(--g-text-body-font-family)',
                    }}
                >
                    <div>
                        Выбрано: <strong>{value.format('HH:mm:ss')}</strong>
                    </div>
                    <div style={{marginTop: 8, fontSize: 12, color: 'var(--g-color-text-warning)'}}>
                        ⚠️ Время с 12:00 до 13:00 недоступно (обеденный перерыв)
                    </div>
                </div>
            </div>
        );
    },
    args: {
        views: ['hours', 'minutes'],
    },
};

export const ControlledComponent: Story = {
    render: ControlledTemplate,
    args: {
        views: ['hours', 'minutes', 'seconds'],
    },
    parameters: {
        docs: {
            description: {
                story: 'Пример полностью контролируемого компонента с внешним управлением состоянием',
            },
        },
    },
};

export const UncontrolledComponent: Story = {
    render: UncontrolledTemplate,
    args: {
        views: ['hours', 'minutes'],
    },
    parameters: {
        docs: {
            description: {
                story: 'Пример неконтролируемого компонента с defaultValue',
            },
        },
    },
};

export const WithTimeZone: Story = {
    render: (args: any) => {
        const [value, setValue] = React.useState<DateTime>(dateTime());
        const [timeZone, setTimeZone] = React.useState('America/New_York');

        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    padding: 20,
                }}
            >
                <div>
                    <label style={{fontSize: 14, marginRight: 8}} htmlFor="timezone-select">
                        Часовой пояс:
                    </label>
                    <select
                        id="timezone-select"
                        value={timeZone}
                        onChange={(e) => setTimeZone(e.target.value)}
                        style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            border: '1px solid var(--g-color-line-generic)',
                        }}
                    >
                        <option value="America/New_York">America/New_York</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="Europe/Moscow">Europe/Moscow</option>
                        <option value="Asia/Tokyo">Asia/Tokyo</option>
                        <option value="Australia/Sydney">Australia/Sydney</option>
                    </select>
                </div>
                <TimeSelection {...args} value={value} onUpdate={setValue} timeZone={timeZone} />
                <div
                    style={{
                        fontSize: 14,
                        color: 'var(--g-color-text-secondary)',
                        fontFamily: 'var(--g-text-body-font-family)',
                    }}
                >
                    <div>
                        Выбрано: <strong>{value.format('HH:mm:ss')}</strong>
                    </div>
                    <div style={{marginTop: 4, fontSize: 12}}>Часовой пояс: {timeZone}</div>
                </div>
            </div>
        );
    },
    args: {
        views: ['hours', 'minutes'],
    },
};

export const AllViews: Story = {
    render: (args: any) => {
        const [value, setValue] = React.useState<DateTime>(dateTime());

        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    padding: 20,
                }}
            >
                <TimeSelection {...args} value={value} onUpdate={setValue} />
                <div
                    style={{
                        fontSize: 14,
                        color: 'var(--g-color-text-secondary)',
                        fontFamily: 'var(--g-text-body-font-family)',
                    }}
                >
                    <div>
                        Выбрано: <strong>{value.format('HH:mm:ss')}</strong>
                    </div>
                    <div style={{marginTop: 8, fontSize: 12}}>
                        <div>Часы: {value.hour()}</div>
                        <div>Минуты: {value.minute()}</div>
                        <div>Секунды: {value.second()}</div>
                    </div>
                </div>
            </div>
        );
    },
    args: {
        views: ['hours', 'minutes', 'seconds'],
        timeSteps: {hours: 1, minutes: 1, seconds: 1},
    },
};

export const Playground: Story = {
    render: Template,
    args: {
        ampm: false,
        disabled: false,
        readOnly: false,
        views: ['hours', 'minutes'],
        timeSteps: {hours: 1, minutes: 5, seconds: 1},
        defaultFocusView: 'hours',
    },
    parameters: {
        docs: {
            description: {
                story: 'Интерактивная площадка для экспериментов с различными настройками компонента',
            },
        },
    },
};
