import React, { useCallback, useState } from 'react';
import ImagePreviewModal from '../components/ImagePreviewModal';
import { imageUrl } from '../utils/image';

// Full-screen photo viewer: const { openPreview, previewModal } = useImagePreview()
const useImagePreview = () => {
    const [preview, setPreview] = useState({ open: false, src: '', alt: '' });

    const openPreview = useCallback((path, name) => {
        setPreview({ open: true, src: imageUrl(path), alt: `${name} image` });
    }, []);

    const previewModal = (
        <ImagePreviewModal
            open={preview.open}
            onClose={() => setPreview((p) => ({ ...p, open: false }))}
            imageSrc={preview.src}
            imageAlt={preview.alt}
        />
    );

    return { openPreview, previewModal };
};

export default useImagePreview;
