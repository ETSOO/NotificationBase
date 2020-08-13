import { Notification } from './Notification';

/**
 * Notification add
 */
export interface NotificationAdd {
    <UI>(notification: Notification<UI>): void;
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
class NotificationContainer {
    // Registered add action
    private registeredAdd?: NotificationAdd;

    // Registered remove action
    private registeredRemove?: NotificationRemove;

    /**
     * Add notification
     * @param notification Notification
     */
    add<UI>(notification: Notification<UI>): void {
        // Support dismiss action
        const { onDismiss } = notification;
        notification.onDismiss = (reason) => {
            // Remove the notification
            this.remove(notification.id);

            // Custom onDismiss callback
            if (onDismiss) onDismiss(reason);
        };

        if (this.registeredAdd) this.registeredAdd(notification);
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
export default new NotificationContainer();
