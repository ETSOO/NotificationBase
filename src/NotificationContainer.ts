import { Notification, NotificationAlign } from './Notification';

/**
 * Notification action
 */
export interface NotificationAction {
    (id: string, remove: boolean): void;
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
     * Notifications
     */
    readonly notifications: NotificationDictionary;

    private count: number;
    /**
     * Notification count
     */
    get notificationCount(): number {
        return this.count;
    }

    /**
     * Constructor
     */
    constructor() {
        // Init notification collection
        this.count = 0;
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

        // Support dismiss action
        const { onDismiss } = notification;
        notification.onDismiss = () => {
            // Remove the notification
            this.remove(notification);

            // Custom onDismiss callback
            if (onDismiss) onDismiss();
        };

        // Add to the collection
        const alignItems = this.notifications[notification.align];
        if (top) alignItems.unshift(notification);
        else alignItems.push(notification);

        // Add count
        this.count++;

        // Call the registered add method
        this.registeredUpdate(notification.id, false);

        // Auto dismiss in timespan seconds
        if (notification.timespan > 0)
            notification.dismiss(notification.timespan);
    }

    /**
     * Remove notification
     * @param notification Notification
     */
    remove(notification: Notification<any>): void {
        if (this.registeredUpdate == null) {
            throw new Error('Registration required');
        }

        // Remove from the collection
        const alignItems = this.notifications[notification.align];
        const index = alignItems.findIndex((n) => n.id === notification.id);
        if (index !== -1) {
            alignItems.splice(index, 1);

            // Deduct count
            this.count--;

            // Trigger remove
            this.registeredUpdate(notification.id, true);
        }
    }

    /**
     * Register component action
     * @param update Update action
     */
    register(update: NotificationAction) {
        this.registeredUpdate = update;
    }
}

/**
 * Notification container object
 */
export const NotificationContainer = new NotificationContainerClass();
