import {getTimeZonesList} from '@gravity-ui/date-utils';
import {ChevronRight} from '@gravity-ui/icons';
import {Button, Icon, Select, TextInput, useMobile} from '@gravity-ui/uikit';

import {block} from '../../../../utils/cn';

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
                                placeholder={i18n('Search')}
                            />
                            <Button
                                className={b('clear')}
                                size={mobile ? 'xl' : undefined}
                                onClick={() => {
                                    props.onUpdate(undefined);
                                }}
                            >
                                {i18n('Clear')}
                            </Button>
                        </div>
                    );
                }}
                renderControl={(opts) => {
                    return (
                        <Button
                            onClick={opts.onClick}
                            ref={opts.ref}
                            view="flat"
                            size={mobile ? 'xl' : undefined}
                            extraProps={{
                                onKeyDown: opts.onKeyDown,
                            }}
                            className={b('control', {platform: mobile ? 'mobile' : 'desktop'})}
                        >
                            <div
                                className={b('control-label', {empty: !timeZone})}
                                title={timeZone}
                            >
                                {timeZone
                                    ? `${timeZone} (${getTimeZoneOffset(timeZone)})`
                                    : i18n('Empty_zone')}
                            </div>
                            <Icon
                                className={b('control-icon', {mobile})}
                                data={ChevronRight}
                                size={mobile ? 20 : 16}
                            />
                        </Button>
                    );
                }}
                renderOption={({value: zone}) => renderItem(zone)}
                value={props.timeZone ? [props.timeZone] : []}
                hasClear={props.timeZone !== 'UTC'}
                onUpdate={([newTimeZone]) => {
                    props.onUpdate(newTimeZone);
                }}
            />
        </div>
    );
}
