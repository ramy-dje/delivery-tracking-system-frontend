import { AxiosError } from 'axios';

export interface ProblemDetails {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
    instance?: string;
    traceId?: string;
    timestamp?: string;
    exceptionType?: string;
    errors?: Record<string, string[]>;
}

export interface ApiError {
    message: string;
    statusCode?: number;
    problemDetails?: ProblemDetails;
    fieldErrors?: Record<string, string[]>;
}

export const getApiErrorMessage = (
    error: unknown,
    fallback = "An unexpected error occurred"
): string => {
    if (!(error instanceof AxiosError)) {
        return fallback;
    }

    const problemDetails = error.response?.data as ProblemDetails | undefined;

    return (
        problemDetails?.detail ||
        problemDetails?.title ||
        extractValidationSummary(problemDetails?.errors) ||
        error.message ||
        fallback
    );
};

export const getFieldErrors = (
    error: unknown
): Record<string, string[]> | undefined => {
    if (!(error instanceof AxiosError)) return undefined;

    const problemDetails = error.response?.data as ProblemDetails | undefined;
    return problemDetails?.errors;
};

const extractValidationSummary = (
    errors?: Record<string, string[]>
): string | undefined => {
    if (!errors) return undefined;

    const firstField = Object.entries(errors)[0];
    if (!firstField) return undefined;

    const [field, messages] = firstField;
    const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
    return `${fieldName}: ${messages[0]}`;
};

export const parseApiError = (error: unknown): ApiError => {
    const fallback: ApiError = { message: "An unexpected error occurred" };

    if (!(error instanceof AxiosError)) {
        return fallback;
    }

    const problemDetails = error.response?.data as ProblemDetails | undefined;

    return {
        message: getApiErrorMessage(error),
        statusCode: error.response?.status,
        problemDetails,
        fieldErrors: problemDetails?.errors,
    };
};