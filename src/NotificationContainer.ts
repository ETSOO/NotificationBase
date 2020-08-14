import { Notification } from './Notification';

/**
 * Notification add
 */
export interface NotificationAdd {
    (notification: Notification<any>, top: boolean): void;
}

/**
 * Notification remove
 */
export interface NotificationRemove {
    (id: string): Notification<any> | undefined;
}

/**
 * Notification container class
 */
class NotificationContainerClass {
    // Registered add action
    private registeredAdd?: NotificationAdd;

    // Registered remove action
    private registeredRemove?: NotificationRemove;

    /**
     * Add notification
     * @param notification Notification
     * @param top Is insert top
     */
    add(notification: Notification<any>, top: boolean = false): void {
        if (this.registeredAdd == null) {
            throw new Error('Registration required');
        }

        // Support dismiss action
        const { onDismiss } = notification;
        notification.onDismiss = () => {
            // Remove the notification
            this.remove(notification.id);

            // Custom onDismiss callback
            if (onDismiss) onDismiss();
        };

        // Call the registered add method
        this.registeredAdd(notification, top);

        // Auto dismiss in timespan seconds
        if (notification.timespan > 0)
            notification.dismiss(notification.timespan);
    }

    /**
     * Remove notification
     * @param notificationId Notification id
     */
    remove(notificationId: string): void {
        if (this.registeredRemove == null) {
            throw new Error('Registration required');
        }
        this.registeredRemove(notificationId);
    }

    /**
     * Register component methods
     * @param add Add action
     * @param remove Remove action
     */
    register(add: NotificationAdd, remove: NotificationRemove) {
        this.registeredAdd = add;
        this.registeredRemove = remove;
    }
}

/**
 * Notification container object
 */
export const NotificationContainer = new NotificationContainerClass();
