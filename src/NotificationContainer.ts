import {
    Notification,
    NotificationAlign,
    NotificationModalType
} from './Notification';

/**
 * Notification action
 */
export interface NotificationAction {
    (id: string): void;
}

/**
 * Notifications sorted with display align type
 */
export type NotificationDictionary = {
    [key: number]: Notification<any>[];
};

/**
 * Notification container class
 */
class NotificationContainerClass {
    // Registered update action
    private registeredUpdate?: NotificationAction;

    /**
     * Notification collection to display
     */
    readonly notifications: NotificationDictionary;

    /**
     * Is loading bar showing
     */
    get isLoading() {
        return this.notifications[NotificationAlign.Unknown].some(
            (n) => n.open && n.type === NotificationModalType.Loading
        );
    }

    /**
     * Is model window showing
     */
    get isModeling() {
        return this.alignOpenCount(NotificationAlign.Unknown) > 0;
    }

    /**
     * Constructor
     */
    constructor() {
        // Init notification collection
        this.notifications = {};
        for (const align in NotificationAlign) {
            if (!isNaN(Number(align))) this.notifications[align] = [];
        }
    }

    /**
     * Add notification
     * @param notification Notification
     * @param top Is insert top
     */
    add(notification: Notification<any>, top: boolean = false): void {
        if (this.registeredUpdate == null) {
            throw new Error('Registration required');
        }

        // Add to the collection
        const alignItems = this.notifications[notification.align];

        if (notification.align === NotificationAlign.Unknown) {
            // Only one modal window is visible
            if (alignItems.length > 0) {
                alignItems[0].dismiss();
            }
            alignItems.push(notification);
        } else {
            if (top) alignItems.unshift(notification);
            else alignItems.push(notification);
        }

        // Call the registered add method
        this.registeredUpdate(notification.id);

        // Auto dismiss in timespan seconds
        if (notification.timespan > 0)
            notification.dismiss(notification.timespan);
    }

    /**
     * Align all notification count
     * @param align Align
     */
    alignCount(align: NotificationAlign) {
        return this.notifications[align].length;
    }

    /**
     * Align open notification count
     * @param align Align
     */
    alignOpenCount(align: NotificationAlign) {
        const items = this.notifications[align];
        return items.filter((item) => item.open).length;
    }

    /**
     * Dispose all notifications
     */
    dispose(): void {
        for (const align in this.notifications) {
            const items = this.notifications[align];
            items.forEach((item) => item.dispose());
        }
    }

    /**
     * Register component action
     * @param update Update action
     */
    register(update: NotificationAction): void {
        this.registeredUpdate = update;
    }
}

/**
 * Notification container object
 */
export const NotificationContainer = new NotificationContainerClass();
