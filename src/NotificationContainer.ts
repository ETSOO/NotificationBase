import {
    INotificaseBase,
    INotification,
    NotificationAlign,
    NotificationMessageType,
    NotificationModalType,
    NotificationParameters,
    NotificationReturn,
    NotificationType
} from './Notification';

/**
 * Notification action
 */
export interface NotificationAction<UI> {
    (notification: INotification<UI>, dismiss: boolean): void;
}

/**
 * Notifications sorted with display align type
 */
export type NotificationDictionary<UI> = {
    [key: number]: INotification<UI>[];
};

/**
 * Notification label keys
 */
export interface INotifierLabelKeys {
    alertTitle: string;
    alertOK: string;
    confirmTitle: string;
    confirmYes: string;
    confirmNo: string;
    promptTitle: string;
    promptCancel: string;
    promptOK: string;
    loading: string;
}

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
     */
    alert(error: string, callback?: NotificationReturn<void>): void;

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
     * @param callback Callback
     * @param title Title
     * @param props More properties
     */
    prompt(
        message: string,
        callback: NotificationReturn<string>,
        title?: string,
        props?: any
    ): void;

    /**
     * Show loading
     * @param title Title
     */
    showLoading(title?: string): void;
}

/**
 * Label keys for localization
 */
export const NotifierLabelKeys: INotifierLabelKeys = {
    alertTitle: 'warning',
    alertOK: 'ok',
    confirmTitle: 'confirm',
    confirmYes: 'ok',
    confirmNo: 'cancel',
    promptTitle: 'prompt',
    promptCancel: 'cancel',
    promptOK: 'ok',
    loading: 'loading'
};

/**
 * Notification container class
 */
export abstract class NotificationContainer<UI> implements INotifier<UI> {
    // Registered update action
    private update: NotificationAction<UI>;

    // Last loading
    private lastLoading?: INotification<UI>;

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
        for (const align in NotificationAlign) {
            if (!isNaN(Number(align))) this.notifications[align] = [];
        }
    }

    /**
     * Add raw definition
     * @param data Notification data definition
     */
    protected abstract addRaw(data: INotificaseBase): INotification<UI>;

    /**
     * Add notification
     * @param notification Notification
     * @param top Is insert top
     */
    add(notification: INotification<UI>, top: boolean = false): void {
        // Align collection
        const alignItems = this.notifications[notification.align];

        // Support dismiss action
        const { align, timespan, onDismiss } = notification;
        notification.onDismiss = () => {
            // Remove from the collection
            const index = alignItems.findIndex(
                (item) => item.id === notification.id
            );
            if (index > -1) alignItems.splice(index, 1);

            // Call the registered callback
            this.doRegister(notification, true);

            // Custom onDismiss callback
            if (onDismiss) onDismiss();
        };

        // Add to the collection
        if (align === NotificationAlign.Unknown) {
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
        if (timespan > 0) notification.dismiss(timespan);
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
     * Dispose all notifications
     */
    dispose(): void {
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
        // Call
        this.update(item, dismiss);
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
     */
    alert(error: string, callback?: NotificationReturn<void>) {
        // Setup
        const n: INotificaseBase = {
            type: NotificationType.Error,
            content: error
        };

        // Callback
        n.onReturn = callback;

        // Add to the collection
        this.addRaw(n);
    }

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
    ) {
        // Setup
        const n: INotificaseBase = {
            type: NotificationType.Confirm,
            content: message,
            title
        };

        // Callback
        n.onReturn = callback;

        // Add to the collection
        this.addRaw(n);
    }

    /**
     * Hide loading
     */
    hideLoading() {
        this.lastLoading?.dismiss();
    }

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
    ) {
        // Destruct
        const { align, timespan, callback } = parameters ?? {};

        // Setup
        const n: INotificaseBase = {
            type,
            content: message,
            title,
            align
        };

        // Additional parameters
        n.onReturn = callback;
        if (timespan) n.timespan = timespan;

        // Add to the collection
        return this.addRaw(n);
    }

    /**
     * Prompt action
     * @param message Message
     * @param callback Callback
     * @param title Title
     * @param props More properties
     */
    prompt(
        message: string,
        callback: NotificationReturn<string>,
        title?: string,
        props?: any
    ) {
        // Setup
        const n: INotificaseBase = {
            type: NotificationType.Prompt,
            content: message,
            title
        };

        // Additional parameters
        n.inputProps = props;

        // Callback
        n.onReturn = callback;

        // Add to the collection
        this.addRaw(n);
    }

    /**
     * Show loading
     * @param title Title
     */
    showLoading(title?: string) {
        // Setup
        const n: INotificaseBase = {
            type: NotificationType.Loading,
            content: title ?? ''
        };

        // Add to the collection
        // Keep the reference
        this.lastLoading = this.addRaw(n);
    }
}
