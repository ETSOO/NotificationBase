import {
    INotification,
    NotificationAlign,
    NotificationMessageType,
    NotificationModalType,
    NotificationParameters,
    NotificationReturn
} from './Notification';

/**
 * Notification action
 * @param items [notificationId, dismiss] array
 */
export interface NotificationAction<UI> {
    (items: [INotification<UI>, boolean][]): void;
}

/**
 * Notifications sorted with display align type
 */
export type NotificationDictionary<UI> = {
    [key: number]: INotification<UI>[];
};

/**
 * Notifier interface
 */
export interface INotifier<UI> {
    /**
     * Is loading bar showing
     */
    readonly isLoading: boolean;

    /**
     * Is model window showing
     */
    readonly isModeling: boolean;

    /**
     * Add notification
     * @param notification Notification
     * @param top Is insert top
     */
    add(notification: INotification<UI>, top?: boolean): void;

    /**
     * Report error
     * @param error Error message
     * @param callback Callback
     * @param buttonLabel Confirm button label
     */
    alert(
        error: string,
        callback?: NotificationReturn<void>,
        buttonLabel?: string
    ): void;

    /**
     * Align all notification count
     * @param align Align
     */
    alignCount(align: NotificationAlign): number;

    /**
     * Align open notification count
     * @param align Align
     */
    alignOpenCount(align: NotificationAlign): number;

    /**
     * Remove all closed notification
     */
    clear(): void;

    /**
     * Confirm action
     * @param message Message
     * @param title Title
     * @param callback Callback
     */
    confirm(
        message: string,
        title?: string,
        callback?: NotificationReturn<boolean>
    ): void;

    /**
     * Dispose all notifications
     */
    dispose(): void;

    /**
     * Get notification with align and id
     * @param align Align
     * @param id Notification id
     */
    get(align: NotificationAlign, id: string): INotification<UI> | undefined;

    /**
     * Get notification with id
     * @param id Notification id
     */
    getById(id: string): INotification<UI> | undefined;

    /**
     * Hide loading
     */
    hideLoading(): void;

    /**
     * Show a message
     * @param type Message type
     * @param message Message
     * @param title Title
     * @param parameters Parameters
     */
    message(
        type: NotificationMessageType,
        message: string,
        title?: string,
        parameters?: NotificationParameters
    ): INotification<UI>;

    /**
     * Prompt action
     * @param message Message
     * @param title Title
     * @param props More properties
     * @param callback Callback
     */
    prompt(
        message: string,
        title?: string,
        props?: any,
        callback?: NotificationReturn<string>
    ): void;

    /**
     * Show loading
     * @param title Title
     */
    showLoading(title?: string): void;
}

/**
 * Notification container class
 */
export abstract class NotificationContainer<UI> implements INotifier<UI> {
    // Registered update action
    private update: NotificationAction<UI>;

    // Register action timeout seed
    private registerSeed: number = 0;

    // Register items
    private registerItems: [INotification<UI>, boolean][] = [];

    /**
     * Notification collection to display
     */
    readonly notifications: NotificationDictionary<UI>;

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
    constructor(update: NotificationAction<UI>) {
        // Update callback
        this.update = update;

        // Init notification collection
        this.notifications = {};
        for (const align in Object.keys(NotificationAlign)) {
            this.notifications[align] = [];
        }
    }

    /**
     * Add notification
     * @param notification Notification
     * @param top Is insert top
     */
    add(notification: INotification<UI>, top: boolean = false): void {
        // Support dismiss action
        const { onDismiss } = notification;
        notification.onDismiss = () => {
            // Call the registered callback
            this.doRegister(notification, true);

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
        this.doRegister(notification, false);

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
    private doRegister(item: INotification<UI>, dismiss: boolean): void {
        // Clear timeout
        this.clearRegisterSeed();

        // Add the item
        this.registerItems.push([item, dismiss]);

        // Delay trigger
        // 10 miliseconds delay
        this.registerSeed = window.setTimeout(
            this.doRegisterAction.bind(this),
            10,
            item,
            dismiss
        );
    }

    // Call register action
    private doRegisterAction(): void {
        // Call
        this.update(this.registerItems);

        // Reset items
        this.registerItems = [];
    }

    /**
     * Get notification with align and id
     * @param align Align
     * @param id Notification id
     */
    get(align: NotificationAlign, id: string): INotification<UI> | undefined {
        const items = this.notifications[align];
        return items.find((item) => item.id === id);
    }

    /**
     * Get notification with id
     * @param id Notification id
     */
    getById(id: string): INotification<UI> | undefined {
        for (const align in Object.keys(NotificationAlign)) {
            var item = this.get((align as unknown) as NotificationAlign, id);
            if (item != null) return item;
        }
        return undefined;
    }

    /**
     * Report error
     * @param error Error message
     * @param callback Callback
     * @param buttonLabel Confirm button label
     */
    abstract alert(
        error: string,
        callback?: NotificationReturn<void>,
        buttonLabel?: string
    ): void;

    /**
     * Confirm action
     * @param message Message
     * @param title Title
     * @param callback Callback
     */
    abstract confirm(
        message: string,
        title?: string,
        callback?: NotificationReturn<boolean>
    ): void;

    /**
     * Hide loading
     */
    abstract hideLoading(): void;

    /**
     * Show a message
     * @param type Message type
     * @param message Message
     * @param title Title
     * @param parameters Parameters
     */
    abstract message(
        type: NotificationMessageType,
        message: string,
        title?: string,
        parameters?: NotificationParameters
    ): INotification<UI>;

    /**
     * Prompt action
     * @param message Message
     * @param title Title
     * @param props More properties
     * @param callback Callback
     */
    abstract prompt(
        message: string,
        title?: string,
        props?: any,
        callback?: NotificationReturn<string>
    ): void;

    /**
     * Show loading
     * @param title Title
     */
    abstract showLoading(title?: string): void;
}
