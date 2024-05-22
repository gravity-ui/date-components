import React from 'react';

import {ArrowsRotateRight, ChevronDown} from '@gravity-ui/icons';
import type {PopupPlacement} from '@gravity-ui/uikit';
import {Button, Flex, List, Popup} from '@gravity-ui/uikit';

import {block} from '../../../../../utils/cn';
import {i18n} from '../../../i18n';
import {
    getDurationFromValue,
    getHumanDurationName,
    stringifyDuration,
} from '../../../utils/duration';
import {usePopupState} from '../../hooks';

import './RefreshIntervalSelect.scss';

interface RefreshIntervalDescription {
    value: number;
    text: string;
}

interface RefreshIntervalSelectProps {
    refreshInterval: number;
    options: number[];
    onRefreshIntervalUpdate: (value: number) => void;
    onSwitchOffStickToNow?: () => void;
    onRefreshClick?: () => void;
    useText?: boolean;
}

const b = block('thin-timeline-refresher');

const placement: PopupPlacement = [
    'bottom-end',
    'bottom-start',
    'bottom',
    'top-end',
    'top-start',
    'top',
];

export function RefreshIntervalSelect({
    refreshInterval,
    options,
    onRefreshIntervalUpdate,
    useText,
    onSwitchOffStickToNow,
    onRefreshClick,
}: RefreshIntervalSelectProps) {
    const refreshIntervals = React.useMemo(() => {
        return options.map((durationValue): RefreshIntervalDescription => {
            if (durationValue === 0) {
                return {value: 0, text: i18n('label.refresh-off')};
            }

            return {
                value: durationValue,
                text: getHumanDurationName(getDurationFromValue(durationValue)),
            };
        });
    }, [options]);

    const text = React.useMemo(() => {
        if (useText) {
            return (
                refreshIntervals.find((int) => int.value === refreshInterval)?.text ??
                i18n('label.refresh-off')
            );
        }

        if (!refreshInterval) {
            return i18n('label.refresh-off');
        }

        return stringifyDuration(getDurationFromValue(refreshInterval));
    }, [refreshIntervals, refreshInterval, useText]);

    // thanks prettier, that's a lot more convenient
    const {anchorRef, popupOpen, setPopupOpen, openPopup, closePopup} = usePopupState<
        HTMLButtonElement | HTMLAnchorElement
    >();

    const renderItem = React.useCallback(
        (item: RefreshIntervalDescription) => <div className={b('option')}>{item.text}</div>,
        [],
    );
    const selectItem = React.useCallback(
        (item: RefreshIntervalDescription) => {
            onRefreshIntervalUpdate(item.value);
            setPopupOpen(false);
            if (!item.value && onSwitchOffStickToNow) {
                onSwitchOffStickToNow();
            }
        },
        [onRefreshIntervalUpdate, onSwitchOffStickToNow, setPopupOpen],
    );
    const togglePopup = React.useCallback(() => {
        if (popupOpen) {
            closePopup();
        } else {
            openPopup();
        }
    }, [popupOpen, openPopup, closePopup]);

    return (
        <Flex gap="0.5">
            <Button size="s" view="flat" onClick={onRefreshClick}>
                <Button.Icon>
                    <ArrowsRotateRight />
                </Button.Icon>
            </Button>
            <Button size="s" ref={anchorRef} view="flat" onClick={togglePopup}>
                {text}
                <Button.Icon>
                    <ChevronDown />
                </Button.Icon>
            </Button>
            <Popup
                anchorRef={anchorRef}
                open={popupOpen}
                onClose={closePopup}
                placement={placement}
                keepMounted
            >
                <List
                    items={refreshIntervals}
                    filterable={false}
                    virtualized={false}
                    itemHeight={28}
                    renderItem={renderItem}
                    onItemClick={selectItem}
                    className={b('options')}
                />
            </Popup>
        </Flex>
    );
}
