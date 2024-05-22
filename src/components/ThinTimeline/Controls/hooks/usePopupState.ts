import React from 'react';

export const usePopupState = <T>(initialOpen = false) => {
    const anchorRef = React.useRef<T>(null);
    const [popupOpen, setPopupOpen] = React.useState(initialOpen);
    const openPopup = React.useCallback(() => setPopupOpen(true), []);
    const closePopup = React.useCallback(() => setPopupOpen(false), []);
    return {
        anchorRef,
        popupOpen,
        setPopupOpen,
        openPopup,
        closePopup,
    };
};
