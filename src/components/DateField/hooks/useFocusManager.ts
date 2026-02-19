import React from 'react';

import type {DateFieldSection, DateFieldSectionType} from '../types';
import {isEditableSectionType} from '../utils';

interface FocusManagerOptions {
    sections: DateFieldSection[];
}

interface FocusManager {
    /** Active section index */
    activeSectionIndex: number;
    /** Selected sections */
    selectedSectionIndexes: {startIndex: number; endIndex: number} | null;
    /** Return true if it is the first section */
    isFistSection: (position: number) => boolean;
    /** Return true if it is the last section */
    isLastSection: (position: number) => boolean;
    /** Focus section in position or all sections. */
    focusSection: (position: number | 'all') => void;
    /** Focuses the next section if present */
    focusNextSection: () => void;
    /** Focuses the previous section if present */
    focusPreviousSection: () => void;
    /** Focuses the first section */
    focusFirstSection: () => void;
    /** Focuses the last section */
    focusLastSection: () => void;
}

export function useFocusManager({sections}: FocusManagerOptions): FocusManager {
    const [selectedSections, setSelectedSections] = React.useState<number | 'all'>(-1);

    const connections = React.useMemo(() => connectEditableSections(sections), [sections]);

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
                endIndex: connections.length - 1,
            };
        }

        if (typeof selectedSections === 'number') {
            return {startIndex: selectedSections, endIndex: selectedSections};
        }

        return selectedSections;
    }, [selectedSections, connections]);

    const activeSectionIndex = getCurrentEditableSectionIndex(connections, selectedSections);

    return {
        activeSectionIndex,
        selectedSectionIndexes,
        isFistSection(position) {
            const p = connections[position];
            if (!p) {
                return false;
            }
            return position === p.previousEditableSection;
        },
        isLastSection(position) {
            const p = connections[position];
            if (!p) {
                return false;
            }
            return position === p.nextEditableSection;
        },
        focusSection(index: number | 'all') {
            if (index === 'all' || index === -1) {
                setSelectedSections(index);
            } else {
                setSelectedSections(getCurrentEditableSectionIndex(connections, index));
            }
        },
        focusNextSection() {
            const currentIndex = selectedSections === 'all' ? 0 : selectedSections;
            const newIndex = connections[currentIndex]?.nextEditableSection ?? -1;
            if (newIndex !== -1) {
                setSelectedSections(newIndex);
            }
        },
        focusPreviousSection() {
            const currentIndex = selectedSections === 'all' ? 0 : selectedSections;
            const newIndex = connections[currentIndex]?.previousEditableSection ?? -1;
            if (newIndex !== -1) {
                setSelectedSections(newIndex);
            }
        },
        focusFirstSection() {
            const newIndex = connections[0]?.previousEditableSection ?? -1;
            if (newIndex !== -1) {
                setSelectedSections(newIndex);
            }
        },
        focusLastSection() {
            const newIndex = connections[sections.length - 1]?.nextEditableSection ?? -1;
            if (newIndex !== -1) {
                setSelectedSections(newIndex);
            }
        },
    };
}

interface Connection {
    type: DateFieldSectionType;
    previousEditableSection: number;
    nextEditableSection: number;
}

function connectEditableSections(sections: DateFieldSection[]) {
    let previousEditableSection = -1;
    const connections: Connection[] = new Array(sections.length);
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (!section) {
            throw new Error('section must be defined');
        }

        const connection = {
            type: section.type,
            previousEditableSection,
            nextEditableSection: previousEditableSection,
        };
        connections[i] = connection;

        if (isEditableSectionType(connection.type)) {
            for (let j = Math.max(0, previousEditableSection); j <= i; j++) {
                const prevSection = connections[j];
                if (prevSection) {
                    prevSection.nextEditableSection = i;
                    if (prevSection.previousEditableSection === -1) {
                        prevSection.previousEditableSection = i;
                    }
                }
            }
            previousEditableSection = i;
        }
    }

    return connections;
}

function getCurrentEditableSectionIndex(sections: Connection[], selectedSections: 'all' | number) {
    const currentIndex =
        selectedSections === 'all' || selectedSections === -1 ? 0 : selectedSections;
    const section = sections[currentIndex];
    if (section && !isEditableSectionType(section.type)) {
        return section.nextEditableSection;
    }
    return isEditableSectionType(section?.type) ? currentIndex : -1;
}
