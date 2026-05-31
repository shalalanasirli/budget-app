import api from './api';

export interface ScanReceiptResponse {
    merchant: string | null;
    amount: number | null;
    suggestedCategoryId: string | null;
}

export const receiptService = {
    scan: (imageUri: string, fileName: string) => {
        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            name: fileName,
            type: 'image/jpeg',
        } as any);
        return api.post<ScanReceiptResponse>('/receipts/scan', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};
