
import { getApiErrorMessage } from "./ApiErrorHandler";

interface ToastService {
    success: (message: string) => void;
    error: (message: string) => void;
}

export const showApiError = (
    error: unknown,
    toast: ToastService,
    fallback?: string
) => {
    const message = getApiErrorMessage(error, fallback);
    toast.error(message);
};