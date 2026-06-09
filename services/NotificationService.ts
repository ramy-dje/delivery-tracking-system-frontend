import api from "@/lib/api";

import {
    INotificationsResponse,
    IUnreadNotificationResponse,
    IMarkNotificationResponse,
    IMarkAllNotificationsResponse,
} from "@/types/notification";

const BASE_URL = "/notifications";

export const getNotifications = async (
    page = 1,
    limit = 20
): Promise<INotificationsResponse> => {
    const { data } = await api.get(BASE_URL, {
        params: {
            page,
            limit,
        },
    });

    return data;
};

export const markNotificationAsRead = async (
    notificationId: string
): Promise<IMarkNotificationResponse> => {
    const { data } = await api.patch(
        `${BASE_URL}/${notificationId}`
    );

    return data;
};

export const markAllNotificationsAsRead =
    async (): Promise<IMarkAllNotificationsResponse> => {
        const { data } = await api.patch(
            `${BASE_URL}/all`
        );

        return data;
    };

export const verifyUnreadNotifications =
    async (): Promise<IUnreadNotificationResponse> => {
        const { data } = await api.get(
            `${BASE_URL}/unread`
        );
        return data;
    };