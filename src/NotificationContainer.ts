import { Notification } from './Notification';

/**
 * Notification add
 */
export interface NotificationAdd {
    <UI>(notification: Notification<UI>, top: boolean): void;
}

/**
 * Notification remove
 */
export interface NotificationRemove {
    (id: string): void;
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
    add<UI>(notification: Notification<UI>, top: boolean = false): void {
        // Support dismiss action
        const { onDismiss } = notification;
        notification.onDismiss = (reason) => {
            // Remove the notification
            this.remove(notification.id);

            // Custom onDismiss callback
            if (onDismiss) onDismiss(reason);
        };

        if (this.registeredAdd) {
            // Call the registered add method
            this.registeredAdd(notification, top);

            // Auto dismiss in timespan seconds
            if (notification.timespan > 0)
                notification.dismiss(notification.timespan);
        }
    }

    /**
     * Remove notification
     * @param notificationId Notification id
     */
    remove(notificationId: string): void {
        if (this.registeredRemove) this.registeredRemove(notificationId);
    }

    /**
     *
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
