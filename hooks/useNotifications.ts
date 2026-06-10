import { useState, useEffect, useCallback } from "react";
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    verifyUnreadNotifications,
} from "@/services/NotificationService";
import { INotification } from "@/types/notification";
import { parseApiError } from "@/utils/apiErrorHandler";

export function useNotifications() {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await verifyUnreadNotifications();
            setUnreadCount(res.unread_count);
        } catch (err) {
            const error = parseApiError(err);
            console.log("Failed to fetch unread notifications count: ", error);
        }
    }, []);

    const fetchNotifications = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const res = await getNotifications(p, 10);
            setNotifications(prev =>
                p === 1 ? res.notifications : [...prev, ...res.notifications]
            );
            setUnreadCount(res.unread_count);
            setHasMore(res.pagination.current_page < res.pagination.total_pages);
            setPage(p);
        } catch {
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prev =>
                prev.map(n => (n._id === id ? { ...n, is_read: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { }
    }, []);

    const markAllRead = useCallback(async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch { }
    }, []);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) fetchNotifications(page + 1);
    }, [loading, hasMore, page, fetchNotifications]);

    // Poll unread count every 60s
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60_000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        hasMore,
        fetchNotifications,
        markAsRead,
        markAllRead,
        loadMore,
    };
}