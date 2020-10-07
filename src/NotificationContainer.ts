import {
    Notification,
    NotificationAlign,
    NotificationModalType
} from './Notification';

/**
 * Notification action
 * @param items [notificationId, dismiss] array
 */
export interface NotificationAction {
    (items: [string, boolean][]): void;
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

    // Register action timeout seed
    private registerSeed: number = 0;

    // Register items
    private registerItems: [string, boolean][] = [];

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
        // Support dismiss action
        const { onDismiss } = notification;
        notification.onDismiss = () => {
            // Call the registered callback
            this.doRegister(notification.id, true);

            // Custom onDismiss callback
            if (onDismiss) onDismiss();
        };

        // Add to the collection
        const alignItems = this.notifications[notification.align];

        if (notification.align === NotificationAlign.Unknown) {
            // Dismiss the last modal window
            const modalCount = alignItems.length;
            if (modalCount > 0) {
                alignItems[modalCount - 1].dismiss();
            }
            alignItems.push(notification);
        } else {
            if (top) alignItems.unshift(notification);
            else alignItems.push(notification);
        }

        // Call the registered callback
        this.doRegister(notification.id, false);

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
     * Remove all closed notification
     */
    clear(): void {
        for (const align in this.notifications) {
            // Align items
            const items = this.notifications[align];

            // Loop to remove closed item
            const len = items.length - 1;
            for (let n = len; n >= 0; n--) {
                const notification = items[n];
                if (!notification.open) {
                    notification.dispose();
                    items.splice(n, 1);
                }
            }
        }
    }

    /**
     * Clear register action timeout
     */
    private clearRegisterSeed(): void {
        if (this.registerSeed > 0) {
            window.clearTimeout(this.registerSeed);
            this.registerSeed = 0;
        }
    }

    /**
     * Dispose all notifications
     */
    dispose(): void {
        // Clear timeout seed
        this.clearRegisterSeed();

        // Reset items
        this.registerItems = [];

        for (const align in this.notifications) {
            // Align items
            const items = this.notifications[align];
            items.forEach((item) => item.dispose());

            // Reset
            this.notifications[align] = [];
        }
    }

    /**
     * Call register callback
     * @param id Notification id
     * @param dismiss Is dismiss
     */
    private doRegister(id: string, dismiss: boolean): void {
        // Clear timeout
        this.clearRegisterSeed();

        // Add the item
        this.registerItems.push([id, dismiss]);

        // Delay trigger
        this.registerSeed = window.setTimeout(
            this.doRegisterAction.bind(this),
            50,
            id,
            dismiss
        );
    }

    // Call register action
    private doRegisterAction(): void {
        // Call
        if (this.registeredUpdate) this.registeredUpdate(this.registerItems);

        // Reset items
        this.registerItems = [];
    }

    /**
     * Get notification with align and id
     * @param align Align
     * @param id Notification id
     */
    get(align: NotificationAlign, id: string): Notification<any> | undefined {
        const items = this.notifications[align];
        return items.find((item) => item.id === id);
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
