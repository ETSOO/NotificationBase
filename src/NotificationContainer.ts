import {
    INotificaseBase,
    INotification,
    NotificationAlign,
    NotificationCallProps,
    NotificationContent,
    NotificationMessageType,
    NotificationModalType,
    NotificationParameters,
    NotificationReturn,
    NotificationType
} from './Notification';

/**
 * Notification action
 */
export interface NotificationAction<UI, C extends NotificationCallProps> {
    (notification: INotification<UI, C>, dismiss: boolean): void;
}

/**
 * Notifications sorted with display align type
 */
export type NotificationDictionary<UI, C extends NotificationCallProps> = {
    [key: number]: INotification<UI, C>[];
};

/**
 * Notifier interface
 */
export interface INotifier<UI, C extends NotificationCallProps> {
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
    add(notification: INotification<UI, C>, top?: boolean): void;

    /**
     * Report error or message
     * @param errorOrTitle Error message or title
     * @param callback Callback
     * @param type Type, default is Error
     * @param props Props
     */
    alert(
        errorOrTitle:
            | NotificationContent<UI>
            | [NotificationContent<UI>, NotificationContent<UI>],
        callback?: NotificationReturn<void>,
        type?: NotificationMessageType,
        props?: C
    ): INotification<UI, C>;

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
     * @param props Props
     */
    confirm(
        message: NotificationContent<UI>,
        title?: NotificationContent<UI>,
        callback?: NotificationReturn<boolean>,
        props?: C
    ): INotification<UI, C>;

    /**
     * Dispose all notifications
     */
    dispose(): void;

    /**
     * Get notification with align and id
     * @param align Align
     * @param id Notification id
     */
    get(align: NotificationAlign, id: string): INotification<UI, C> | undefined;

    /**
     * Get notification with id
     * @param id Notification id
     */
    getById(id: string): INotification<UI, C> | undefined;

    /**
     * Hide loading
     * @param force Force to hide, otherwise, only the last one
     */
    hideLoading(force?: boolean): void;

    /**
     * Show a message
     * @param type Message type
     * @param message Message
     * @param title Title
     * @param parameters Parameters
     * @param props Props
     */
    message(
        type: NotificationMessageType,
        message: NotificationContent<UI>,
        title?: NotificationContent<UI>,
        parameters?: NotificationParameters,
        props?: C
    ): INotification<UI, C>;

    /**
     * Popup component as modal
     * @param component Component to popup
     * @param properties Popup properties
     * @returns Result
     */
    popup(
        component: NotificationContent<UI>,
        properties: any
    ): INotification<UI, C>;

    /**
     * Prompt action
     * @param message Message
     * @param callback Callback
     * @param title Title
     * @param props More properties
     */
    prompt<T = string | undefined>(
        message: NotificationContent<UI>,
        callback: NotificationReturn<T>,
        title?: NotificationContent<UI>,
        props?: C
    ): INotification<UI, C>;

    /**
     * Show loading
     * @param title Title
     */
    showLoading(title?: NotificationContent<UI>): void;

    /**
     * Show a success message
     * @param message Message
     * @param title Title
     * @param callback Callback
     * @param timespan Timespan to close
     * @param props Props
     */
    succeed(
        message: NotificationContent<UI>,
        title?: NotificationContent<UI>,
        callback?: NotificationReturn<void>,
        timespan?: number,
        props?: C
    ): INotification<UI, C>;
}

/**
 * Notification container class
 */
export abstract class NotificationContainer<UI, C extends NotificationCallProps>
    implements INotifier<UI, C>
{
    // Registered update action
    private update: NotificationAction<UI, C>;

    // Last loading
    private lastLoading?: INotification<UI, C>;
    private loadingCount = 0;

    /**
     * Notification collection to display
     */
    readonly notifications: NotificationDictionary<UI, C>;

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
    constructor(update: NotificationAction<UI, C>) {
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
     * @param modal Show as modal
     */
    protected abstract addRaw(
        data: INotificaseBase<UI, C>,
        modal?: boolean
    ): INotification<UI, C>;

    /**
     * Add notification
     * @param notification Notification
     * @param top Is insert top
     */
    add(notification: INotification<UI, C>, top: boolean = false): void {
        // Align collection
        const alignItems = this.notifications[notification.align];

        // Support dismiss action
        const { timespan, onDismiss } = notification;
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
        if (top) alignItems.unshift(notification);
        else alignItems.push(notification);

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
    private doRegister(item: INotification<UI, C>, dismiss: boolean): void {
        // Call
        this.update(item, dismiss);
    }

    /**
     * Get notification with align and id
     * @param align Align
     * @param id Notification id
     */
    get(
        align: NotificationAlign,
        id: string
    ): INotification<UI, C> | undefined {
        const items = this.notifications[align];
        return items.find((item) => item.id === id);
    }

    /**
     * Get notification with id
     * @param id Notification id
     */
    getById(id: string): INotification<UI, C> | undefined {
        for (const align in Object.keys(NotificationAlign)) {
            var item = this.get(align as unknown as NotificationAlign, id);
            if (item != null) return item;
        }
        return undefined;
    }

    /**
     * Report error or message
     * @param errorOrTitle Error message or title
     * @param callback Callback
     * @param type Type, default is Error
     * @param props Props
     */
    alert(
        errorOrTitle:
            | NotificationContent<UI>
            | [NotificationContent<UI>, NotificationContent<UI>],
        callback?: NotificationReturn<void>,
        type?: NotificationMessageType,
        props?: C
    ) {
        // Parse messange and title
        let error: NotificationContent<UI>,
            title: NotificationContent<UI> | undefined;
        if (Array.isArray(errorOrTitle)) {
            error = errorOrTitle[0];
            title = errorOrTitle[1];
        } else {
            error = errorOrTitle;
        }

        // Setup
        const n: INotificaseBase<UI, C> = {
            inputProps: props,
            type: type ?? NotificationType.Error,
            title,
            content: error,
            onReturn: callback
        };

        // Add to the collection
        return this.addRaw(n, true);
    }

    /**
     * Confirm action
     * @param message Message
     * @param title Title
     * @param callback Callback
     * @param props Props
     */
    confirm(
        message: NotificationContent<UI>,
        title?: NotificationContent<UI>,
        callback?: NotificationReturn<boolean>,
        props?: C
    ) {
        // Setup
        const n: INotificaseBase<UI, C> = {
            type: NotificationType.Confirm,
            content: message,
            title,
            onReturn: callback,
            inputProps: props
        };

        // Add to the collection
        return this.addRaw(n);
    }

    /**
     * Hide loading
     * @param force Force to hide, otherwise, only the last one
     */
    hideLoading(force?: boolean) {
        // Deduct to count
        this.loadingCount--;

        if (force) this.loadingCount = 0;

        if (this.loadingCount === 0) {
            this.lastLoading?.dismiss();
            this.lastLoading = undefined;
        }
    }

    /**
     * Show a message
     * @param type Message type
     * @param message Message
     * @param title Title
     * @param parameters Parameters
     * @param props Props
     */
    message(
        type: NotificationMessageType,
        message: NotificationContent<UI>,
        title?: NotificationContent<UI>,
        parameters?: NotificationParameters,
        props?: C
    ) {
        // Destruct
        const { align, timespan, callback, modal } = parameters ?? {};

        // Setup
        const n: INotificaseBase<UI, C> = {
            type,
            content: message,
            title,
            align,
            timespan,
            onReturn: callback,
            inputProps: props
        };

        // Add to the collection
        return this.addRaw(n, modal);
    }

    /**
     * Prompt action
     * @param message Message
     * @param callback Callback
     * @param title Title
     * @param props More properties
     */
    prompt<T = string | undefined>(
        message: NotificationContent<UI>,
        callback: NotificationReturn<T>,
        title?: string,
        props?: C
    ) {
        // Setup
        const n: INotificaseBase<UI, C> = {
            type: NotificationType.Prompt,
            content: message,
            title,
            inputProps: props,
            onReturn: callback
        };

        // Add to the collection
        return this.addRaw(n);
    }

    /**
     * Show loading
     * @param title Title
     */
    showLoading(title?: NotificationContent<UI>) {
        // Add to count
        this.loadingCount++;

        if (this.lastLoading == null) {
            // Setup
            const n: INotificaseBase<UI, C> = {
                type: NotificationType.Loading,
                content: title ?? ''
            };

            // Add to the collection
            // Keep the reference
            this.lastLoading = this.addRaw(n);
        }
    }

    /**
     * Popup component as modal
     * @param component Component to popup
     * @param properties Popup properties
     * @returns Result
     */
    popup(component: NotificationContent<UI>, properties: any) {
        // Setup
        const n: INotificaseBase<UI, C> = {
            type: NotificationType.Popup,
            content: component,
            renderSetup: (_options) => {
                return properties;
            }
        };

        // Add to the collection
        return this.addRaw(n);
    }

    /**
     * Show a success message
     * @param message Message
     * @param title Title
     * @param callback Callback
     * @param timespan Timespan to close
     * @param props Props
     */
    succeed(
        message: NotificationContent<UI>,
        title?: NotificationContent<UI>,
        callback?: NotificationReturn<void>,
        timespan?: number,
        props?: C
    ) {
        // Default to zero for constant
        timespan ??= 0;

        // Create as message
        return this.message(
            NotificationMessageType.Success,
            message,
            title,
            {
                align: NotificationAlign.Center,
                modal: true,
                timespan,
                callback
            },
            props
        );
    }
}
