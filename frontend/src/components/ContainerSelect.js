import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, TextField, Typography, createFilterOptions } from '@mui/material';
import { AddCircleOutline as AddIcon, Inventory2Outlined as BoxIcon } from '@mui/icons-material';
import { createContainer, getAllContainers } from '../services/api';

const filter = createFilterOptions({ stringify: (o) => `${o.name} ${o.room_name || ''}` });

/**
 * Searchable container picker. Type a name that doesn't exist yet to create it on the spot.
 * value: container id or null.
 */
const ContainerSelect = ({ value, onChange, label = 'Stored in', excludeIds = [], allowCreate = true, onError, helperText }) => {
    const [containers, setContainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        let active = true;
        getAllContainers()
            .then((data) => active && setContainers(data.items))
            .catch((e) => onError?.(e.message))
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, [onError]);

    const options = useMemo(
        () => containers.filter((c) => !excludeIds.includes(c.id)),
        [containers, excludeIds]
    );
    const selected = containers.find((c) => c.id === value) || null;

    const handleChange = async (event, newValue) => {
        if (newValue && newValue.isNew) {
            setCreating(true);
            try {
                const created = await createContainer({ name: newValue.inputValue });
                setContainers((prev) => [...prev, created]);
                onChange(created.id);
            } catch (e) {
                onError?.(e.message);
            } finally {
                setCreating(false);
            }
            return;
        }
        onChange(newValue ? newValue.id : null);
    };

    return (
        <Autocomplete
            value={selected}
            onChange={handleChange}
            options={options}
            loading={loading || creating}
            disabled={creating}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            getOptionLabel={(o) => (o.isNew ? o.inputValue : o.name || '')}
            filterOptions={(opts, params) => {
                const filtered = filter(opts, params);
                const input = params.inputValue.trim();
                if (allowCreate && input && !opts.some((o) => o.name.toLowerCase() === input.toLowerCase())) {
                    filtered.push({ isNew: true, inputValue: input, id: '__new__' });
                }
                return filtered;
            }}
            renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                    <Box component="li" key={option.id} {...rest} sx={{ gap: 1.5 }}>
                        {option.isNew ? <AddIcon color="primary" fontSize="small" /> : <BoxIcon color="action" fontSize="small" />}
                        <Box sx={{ minWidth: 0 }}>
                            <Typography noWrap>{option.isNew ? `Create "${option.inputValue}"` : option.name}</Typography>
                            {!option.isNew && option.room_name && (
                                <Typography variant="caption" color="text.secondary">{option.room_name}</Typography>
                            )}
                        </Box>
                    </Box>
                );
            }}
            renderInput={(params) => (
                <TextField {...params} label={label} placeholder="Search or create…" helperText={helperText} />
            )}
        />
    );
};

export default ContainerSelect;
