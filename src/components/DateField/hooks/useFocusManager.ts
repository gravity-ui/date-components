import React from 'react';

import type {DateFieldSection} from '../types';
import {getCurrentEditableSectionIndex} from '../utils';

interface FocusManagerOptions {
    sections: DateFieldSection[];
}

interface FocusManager {
    /** */
    activeSectionIndex: number;
    /** Selected sections */
    selectedSectionIndexes: {startIndex: number; endIndex: number} | null;
    /** Sets selection for segment in position. */
    setSelectedSections: (position: number | 'all') => void;
    /** Focuses segment in position */
    focusSectionInPosition: (position: number) => void;
    /** Focuses the next segment if present */
    focusNextSection: () => void;
    /** Focuses the previous segment if present */
    focusPreviousSection: () => void;
    /** Focuses the first segment */
    focusFirstSection: () => void;
    /** Focuses the last segment */
    focusLastSection: () => void;
}

export function useFocusManager({sections}: FocusManagerOptions): FocusManager {
    const [selectedSections, setSelectedSections] = React.useState<number | 'all'>(-1);

    const selectedSectionIndexes = React.useMemo<{
        startIndex: number;
        endIndex: number;
    } | null>(() => {
        if (selectedSections === -1) {
            return null;
        }

        if (selectedSections === 'all') {
            return {
                startIndex: 0,
                endIndex: sections.length - 1,
            };
        }

        if (typeof selectedSections === 'number') {
            return {startIndex: selectedSections, endIndex: selectedSections};
        }

        return selectedSections;
    }, [selectedSections, sections]);

    const activeSectionIndex = getCurrentEditableSectionIndex(sections, selectedSections);

    return {
        activeSectionIndex,
        selectedSectionIndexes,
        setSelectedSections,
        focusSectionInPosition(position) {
            const nextSectionIndex = sections.findIndex((s) => s.end >= position);
            this.setSelectedSections(getCurrentEditableSectionIndex(sections, nextSectionIndex));
        },
        focusNextSection() {
            const currentIndex = selectedSections === 'all' ? 0 : selectedSections;
            const newIndex = sections[currentIndex]?.nextEditableSection ?? -1;
            if (newIndex !== -1) {
                this.setSelectedSections(newIndex);
            }
        },
        focusPreviousSection() {
            const currentIndex = selectedSections === 'all' ? 0 : selectedSections;
            const newIndex = sections[currentIndex]?.previousEditableSection ?? -1;
            if (newIndex !== -1) {
                this.setSelectedSections(newIndex);
            }
        },
        focusFirstSection() {
            const newIndex = sections[0]?.previousEditableSection ?? -1;
            if (newIndex !== -1) {
                this.setSelectedSections(newIndex);
            }
        },
        focusLastSection() {
            const newIndex = sections[sections.length - 1]?.nextEditableSection ?? -1;
            if (newIndex !== -1) {
                this.setSelectedSections(newIndex);
            }
        },
    };
}
