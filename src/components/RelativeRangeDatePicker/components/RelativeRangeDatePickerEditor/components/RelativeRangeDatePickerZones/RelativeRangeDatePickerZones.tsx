import {getTimeZonesList} from '@gravity-ui/date-utils';
import {ChevronRight} from '@gravity-ui/icons';
import {Button, Icon, Select, TextInput, useMobile} from '@gravity-ui/uikit';

import {block} from '../../../../../../utils/cn';
import {pick} from '../../../../../../utils/pick';

import {i18n} from './i18n';
import {getTimeZoneOffset} from './utils/getTimeZoneOffset';

import './RelativeRangeDatePickerZones.scss';

export const b = block('relative-range-date-picker-zones');

interface Props {
    onUpdate: (timeZone: string | undefined) => void;
    timeZone?: string;
}

const zones = getTimeZonesList().map((zone) => {
    return {value: zone};
});

export function RelativeRangeDatePickerZones(props: Props) {
    const [mobile] = useMobile();
    const {timeZone} = props;

    function renderItem(zone: string | null, query?: string) {
        const label = zone || i18n('NoItemsFound', {query});
        return (
            <div className={b('item', {mobile})}>
                <div className={b('item-title')} title={label}>
                    {label}&nbsp;
                </div>
                {zone ? <div className={b('item-offset')}>{getTimeZoneOffset(zone)}</div> : null}
            </div>
        );
    }

    return (
        <div className={b('list-container', {mobile})}>
            <Select
                size={mobile ? 'xl' : undefined}
                className={b('list')}
                options={zones}
                renderEmptyOptions={({filter}) => renderItem(null, filter)}
                filterable={true}
                getOptionHeight={() => (mobile ? 40 : 32)}
                renderFilter={(filterProps) => {
                    return (
                        <div className={b('filter', {mobile})}>
                            <TextInput
                                size={mobile ? 'xl' : undefined}
                                value={filterProps.value}
                                onUpdate={filterProps.onChange}
                                view="clear"
                                placeholder={i18n('Search')}
                            />
                            <Button
                                size={mobile ? 'xl' : undefined}
                                view="flat"
                                onClick={() => {
                                    props.onUpdate(undefined);
                                }}
                            >
                                {i18n('Clear')}
                            </Button>
                        </div>
                    );
                }}
                renderControl={(props) => {
                    return (
                        <div
                            {...pick(props, 'onClick')} // For avoid  jsx-a11y/click-events-have-key-events jsx-a11y/no-static-element-interactions
                            className={b('control', {mobile})}
                        >
                            <div className={b('control-zone', {empty: !timeZone})} title={timeZone}>
                                {timeZone || i18n('Empty_zone')}
                            </div>
                            {timeZone && (
                                <div className={b('control-offset')}>
                                    {getTimeZoneOffset(timeZone)}
                                </div>
                            )}
                            <Icon
                                className={b('control-icon')}
                                data={ChevronRight}
                                size={mobile ? 20 : 16}
                            />
                        </div>
                    );
                }}
                renderOption={({value: zone}) => renderItem(zone)}
                value={props.timeZone ? [props.timeZone] : []}
                hasClear={props.timeZone !== 'UTC'}
                onUpdate={([timeZone]) => {
                    props.onUpdate(timeZone);
                }}
            />
        </div>
    );
}
