import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import ItemModal from '../modals/ItemModal';
import ContainerModal from '../modals/ContainerModal';

const AppContext = createContext(null);

/**
 * App-wide helpers:
 *  - version / refresh(): pages re-fetch when data changes anywhere (e.g. the global "snap" button)
 *  - notify(): snackbar messages
 *  - editItem() / editContainer(): open the shared add/edit dialogs from any page
 */
export const AppProvider = ({ children }) => {
    const [version, setVersion] = useState(0);
    const [toast, setToast] = useState(null);
    const [itemEditor, setItemEditor] = useState(null);
    const [containerEditor, setContainerEditor] = useState(null);

    const refresh = useCallback(() => setVersion((v) => v + 1), []);
    const notify = useCallback((message, severity = 'success') => setToast({ message, severity, key: Date.now() }), []);

    // item: existing item to edit, or null to add. defaults: prefilled fields for a new item
    const editItem = useCallback((item = null, defaults = {}) => setItemEditor({ item, defaults }), []);
    const editContainer = useCallback((container = null, defaults = {}) => setContainerEditor({ container, defaults }), []);

    const value = useMemo(
        () => ({ version, refresh, notify, editItem, editContainer }),
        [version, refresh, notify, editItem, editContainer]
    );

    return (
        <AppContext.Provider value={value}>
            {children}

            {itemEditor && (
                <ItemModal
                    open
                    editingItem={itemEditor.item}
                    defaults={itemEditor.defaults}
                    onClose={() => setItemEditor(null)}
                    onSaved={refresh}
                    notify={notify}
                />
            )}
            {containerEditor && (
                <ContainerModal
                    open
                    editingContainer={containerEditor.container}
                    defaults={containerEditor.defaults}
                    onClose={() => setContainerEditor(null)}
                    onSaved={refresh}
                    notify={notify}
                />
            )}

            <Snackbar
                key={toast?.key}
                open={Boolean(toast)}
                autoHideDuration={toast?.severity === 'error' ? 6000 : 2500}
                onClose={(e, reason) => reason !== 'clickaway' && setToast(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                {toast ? (
                    <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ width: '100%' }}>
                        {toast.message}
                    </Alert>
                ) : undefined}
            </Snackbar>
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
