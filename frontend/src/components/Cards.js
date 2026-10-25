import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    Clear as ClearIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ImageNotSupportedOutlined as NoImageIcon,
    Inventory2Outlined as BoxIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { imageUrl } from '../utils/image';

// Square photo with an icon placeholder when there's no image
export const Thumb = ({ path, alt, icon = <NoImageIcon />, onClick }) => (
    <Box
        onClick={path ? onClick : undefined}
        sx={{
            aspectRatio: '1 / 1',
            width: '100%',
            bgcolor: 'action.hover',
            color: 'text.disabled',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            cursor: path && onClick ? 'zoom-in' : 'inherit',
            '& svg': { fontSize: 40 },
        }}
    >
        {path ? (
            <Box component="img" src={imageUrl(path)} alt={alt} loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : icon}
    </Box>
);

const CardActions = ({ onEdit, onDelete, label }) => (
    <Stack direction="row" justifyContent="flex-end" sx={{ px: 0.5, pb: 0.5, mt: 'auto' }}>
        {onEdit && (
            <IconButton size="small" onClick={onEdit} aria-label={`edit ${label}`}>
                <EditIcon fontSize="small" />
            </IconButton>
        )}
        {onDelete && (
            <IconButton size="small" onClick={onDelete} aria-label={`delete ${label}`}>
                <DeleteIcon fontSize="small" />
            </IconButton>
        )}
    </Stack>
);

export const ItemCard = ({ item, onEdit, onDelete, onImageClick, showContainer = true }) => (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Thumb path={item.image_path} alt={item.name} onClick={() => onImageClick?.(item.image_path, item.name)} />
        {item.quantity !== 1 && item.quantity != null && (
            <Chip
                size="small"
                label={`×${item.quantity}`}
                color={item.quantity === 0 ? 'error' : 'default'}
                sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 600, bgcolor: item.quantity === 0 ? undefined : 'rgba(255,255,255,0.9)' }}
            />
        )}
        <CardContent sx={{ p: 1.5, pb: 0.5, '&:last-child': { pb: 0.5 } }}>
            <Typography variant="subtitle2" noWrap title={item.name}>{item.name}</Typography>
            {showContainer && (
                item.contained_in ? (
                    <Chip
                        component={RouterLink}
                        to={`/containers/${item.contained_in}`}
                        clickable
                        size="small"
                        icon={<BoxIcon />}
                        label={item.container_name || 'Container'}
                        sx={{ mt: 0.5, maxWidth: '100%' }}
                    />
                ) : (
                    <Chip size="small" label="No container" color="warning" variant="outlined" sx={{ mt: 0.5 }} />
                )
            )}
            {item.description && (
                <Typography variant="caption" color="text.secondary" component="p" noWrap sx={{ mt: 0.5 }} title={item.description}>
                    {item.description}
                </Typography>
            )}
        </CardContent>
        <CardActions onEdit={onEdit} onDelete={onDelete} label={item.name} />
    </Card>
);

export const ContainerCard = ({ container, onEdit, onDelete }) => (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardActionArea component={RouterLink} to={`/containers/${container.id}`}>
            <Thumb path={container.image_path} alt={container.name} icon={<BoxIcon />} />
            <CardContent sx={{ p: 1.5, pb: 0.5 }}>
                <Typography variant="subtitle2" noWrap title={container.name}>{container.name}</Typography>
                <Typography variant="caption" color="text.secondary" component="p" noWrap>
                    {container.item_count} item{container.item_count === 1 ? '' : 's'}
                    {container.room_name ? ` · ${container.room_name}` : ''}
                </Typography>
            </CardContent>
        </CardActionArea>
        <CardActions onEdit={onEdit} onDelete={onDelete} label={container.name} />
    </Card>
);

// Responsive card grid: 2 columns on phones, growing with screen width
export const CardGrid = ({ children }) => (
    <Box
        sx={{
            display: 'grid',
            gap: { xs: 1.5, sm: 2 },
            gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(3, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
                lg: 'repeat(5, minmax(0, 1fr))',
            },
        }}
    >
        {children}
    </Box>
);

export const SearchField = ({ value, onChange, placeholder = 'Search…', ...props }) => (
    <TextField
        fullWidth
        size="small"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                    <SearchIcon />
                </InputAdornment>
            ),
            endAdornment: value ? (
                <InputAdornment position="end">
                    <IconButton size="small" onClick={() => onChange('')} aria-label="clear search">
                        <ClearIcon fontSize="small" />
                    </IconButton>
                </InputAdornment>
            ) : null,
        }}
        {...props}
    />
);

export const EmptyState = ({ icon, title, children }) => (
    <Stack alignItems="center" spacing={1} sx={{ py: 6, px: 2, textAlign: 'center', color: 'text.secondary', '& > svg': { fontSize: 56, opacity: 0.5 } }}>
        {icon}
        <Typography variant="h6" color="text.primary">{title}</Typography>
        {children}
    </Stack>
);

export const PageHeader = ({ title, subtitle, action }) => (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" component="h1" fontWeight={600} noWrap>{title}</Typography>
            {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        </Box>
        {action}
    </Stack>
);
