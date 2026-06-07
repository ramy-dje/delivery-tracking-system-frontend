import { AxiosError } from "axios";

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

export interface NodeApiError {
    success?: boolean;
    message?: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}

export interface ApiError {
    message: string;
    statusCode?: number;
    problemDetails?: ProblemDetails;
    fieldErrors?: Record<string, string[]>;
}

type ErrorResponse = Partial<ProblemDetails> &
    Partial<NodeApiError>;

export const getApiErrorMessage = (
    error: unknown,
    fallback = "An unexpected error occurred"
): string => {
    if (!(error instanceof AxiosError)) {
        return fallback;
    }

    const data = error.response?.data as ErrorResponse | undefined;

    return (
        data?.message || // Node.js
        data?.detail || // .NET ProblemDetails
        data?.title || // .NET ProblemDetails
        extractValidationSummary(data?.errors) ||
        error.message ||
        fallback
    );
};

export const getFieldErrors = (
    error: unknown
): Record<string, string[]> | undefined => {
    if (!(error instanceof AxiosError)) {
        return undefined;
    }

    const data = error.response?.data as ErrorResponse | undefined;

    return data?.errors;
};

const extractValidationSummary = (
    errors?: Record<string, string[]>
): string | undefined => {
    if (!errors) {
        return undefined;
    }

    const firstField = Object.entries(errors)[0];

    if (!firstField) {
        return undefined;
    }

    const [field, messages] = firstField;

    if (!messages?.length) {
        return undefined;
    }

    const fieldName =
        field.charAt(0).toUpperCase() + field.slice(1);

    return `${fieldName}: ${messages[0]}`;
};

export const parseApiError = (
    error: unknown
): ApiError => {
    const fallback: ApiError = {
        message: "An unexpected error occurred",
    };

    if (!(error instanceof AxiosError)) {
        return fallback;
    }

    const data = error.response?.data as ErrorResponse | undefined;

    const isProblemDetails =
        data &&
        ("detail" in data ||
            "title" in data ||
            "type" in data);

    return {
        message: getApiErrorMessage(error),
        statusCode:
            data?.statusCode ??
            data?.status ??
            error.response?.status,
        problemDetails: isProblemDetails
            ? (data as ProblemDetails)
            : undefined,
        fieldErrors: data?.errors,
    };
};