export type NotificationType =
    | "account_created"
    | "account_blocked"
    | "account_unblocked"
    | "package_created"
    | "package_status_update"
    | "package_claimed"
    | "package_rejected"
    | "package_cancelled"
    | "package_assigned"
    | "package_issue"
    | "package_issue_resolved"
    | "manifest_sealed"
    | "manifest_arrived"
    | "manifest_discrepancy"
    | "payment_confirmation"
    | "payment_failed"
    | "system_update"
    | "general";

export type ReferenceType =
    | "User"
    | "Package"
    | "Manifest"
    | "Freelancer"
    | "Deliverer"
    | "Transporter"
    | "Manager"
    | "Supervisor"
    | "Branch"
    | "PaymentTransaction"
    | "System";

export type UserType =
    | "admin"
    | "manager"
    | "supervisor"
    | "cashier"
    | "loader"
    | "deliverer"
    | "transporter"
    | "freelancer"
    | "client";

export type PriorityType = "low" | "normal" | "high";

export type IconType =
    | "delivery_app"
    | "freelancer_app"
    | "client_app"
    | "manager_app";

export type RouteType = "to" | "offAll";

export interface INotification {
    _id: string;

    user_id: string;

    user_type?: UserType;

    notification_type: NotificationType;

    reference_id?: string;

    reference_type?: ReferenceType;

    title: string;

    message: string;

    is_read: boolean;

    priority: PriorityType;

    route?: string;

    routeType?: RouteType;

    iconType: IconType;

    expiry_date: string;

    is_expired: boolean;

    hours_until_expiry: number;

    createdAt: string;

    updatedAt: string;
}

export interface INotificationPagination {
    current_page: number;
    total_pages: number;
    total_notifications: number;
    per_page: number;
}

export interface INotificationsResponse {
    notifications: INotification[];
    pagination: INotificationPagination;
    unread_count: number;
}

export interface IUnreadNotificationResponse {
    has_unread_notifications: boolean;
    unread_count: number;
}

export interface IMarkNotificationResponse {
    message: string;
    notification: INotification;
}

export interface IMarkAllNotificationsResponse {
    message: string;
    updated_count: number;
}