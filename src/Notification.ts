import { DataTypes, Utils } from '@etsoo/shared';

/**
 * Display align
 */
export enum NotificationAlign {
    TopLeft,
    TopCenter,
    TopRight,

    Center,
    Unknown, // Reserved for modal, only one instance held at the same time

    BottomLeft,
    BottomCenter,
    BottomRight
}

/**
 * Modal types
 */
export enum NotificationModalType {
    Loading = 0,
    Confirm = 1,
    Prompt = 2,
    Error = 3 // Alert
}

/**
 * Message types
 */
export enum NotificationMessageType {
    Default = 10, // No default then refer to Info
    Success = 11,
    Warning = 12,
    Info = 13,
    Danger = 14 // Error
}

/**
 * Merged type definition below together
 */
export const NotificationType = {
    ...NotificationModalType,
    ...NotificationMessageType
};

/**
 * Notification types
 */
export type NotificationType = NotificationModalType | NotificationMessageType;

/**
 * Notification content
 */
export type NotificationContent<UI> = string | UI;

/**
 * On dismiss callback
 */
export interface NotificationDismiss {
    (): void;
}

/**
 * Notification reander setup
 */
export interface NotifictionRenderSetup {
    (options: any): void;
}

/**
 * On return callback
 * T = string | undefined, Undefined value means cancel
 * return false will prevent default action
 * return string is the error message to show
 */
export interface NotificationReturn<T> {
    (value: T): boolean | string | void | PromiseLike<boolean | string | void>;
}

/**
 * Notification message parameters
 */
export interface NotificationParameters {
    /**
     * Display align
     */
    align?: NotificationAlign;

    /**
     * Callback
     */
    callback?: NotificationReturn<void>;

    /**
     * Show as modal
     */
    modal?: boolean;

    /**
     * Time span to dismiss
     */
    timespan?: number;

    /**
     * Add to the top
     */
    top?: boolean;
}

/**
 * Notification props supported for calls
 */
export type NotificationCallProps = {
    /**
     * Input component properties
     */
    inputProps?: DataTypes.StringRecord;
};

/**
 * Notification render props
 */
export type NotificationRenderProps = object;

/**
 * Notification base interface
 */
export interface INotificaseBase<UI, C extends NotificationCallProps = {}> {
    /**
     * Display align
     */
    readonly align?: NotificationAlign;

    /**
     * Content
     */
    readonly content: NotificationContent<UI>;

    /**
     * Input or control properties
     */
    inputProps?: C;

    /**
     * On dismiss handling
     */
    onDismiss?: NotificationDismiss;

    /**
     * On return value
     */
    onReturn?: NotificationReturn<any>;

    /**
     * Show the icon or hide it
     */
    showIcon?: boolean;

    /**
     * Seconds to auto dismiss
     */
    timespan?: number;

    /**
     * Render setup / callback
     * Add more properties
     */
    renderSetup?: NotifictionRenderSetup;

    /**
     * Title
     */
    readonly title?: NotificationContent<UI>;

    /**
     * Type
     */
    readonly type: NotificationType;
}

/**
 * Notification interface
 */
export interface INotification<UI, C extends NotificationCallProps>
    extends INotificaseBase<UI, C> {
    /**
     * Display align
     */
    readonly align: NotificationAlign;

    /**
     * Seconds to auto dismiss
     */
    timespan: number;

    /**
     * Unique id
     */
    readonly id: string;

    /**
     * Display as modal
     */
    modal: boolean;

    /**
     * Is open or not
     */
    readonly open: boolean;

    /**
     * Reference
     */
    ref?: any;

    /**
     * Content
     */
    readonly content: NotificationContent<UI>;

    /**
     * Title
     */
    readonly title?: NotificationContent<UI>;

    /**
     * Dismiss it
     * @param delaySeconds Delay seconds
     * @returns Is delayed or not
     */
    dismiss(delaySeconds?: number): boolean;

    /**
     * Dispose it
     */
    dispose(): void;

    /**
     * Render method
     * @param props Props
     * @param className Style class name
     * @param options Other options
     */
    render(props: NotificationRenderProps, className?: string): UI | undefined;

    /**
     * Return value
     * Dismiss first, then run callback
     * @param value
     * @returns
     */
    returnValue(value: any): Promise<void>;
}

/**
 * Notification class
 * Generic parameter UI presents UI element type
 */
export abstract class Notification<UI, C extends NotificationCallProps>
    implements INotification<UI, C>
{
    /**
     * Display align
     */
    readonly align: NotificationAlign;

    /**
     * Content
     */
    readonly content: NotificationContent<UI>;

    /**
     * Dismiss timeout seed
     */
    private dismissSeed: number = 0;

    /**
     * Unique id
     */
    readonly id: string;

    /**
     * Input or control properties
     */
    inputProps?: C;

    /**
     * Display as modal
     */
    modal: boolean;

    /**
     * On dismiss handling
     */
    onDismiss?: NotificationDismiss;

    /**
     * On return value
     */
    onReturn?: NotificationReturn<unknown>;

    private _open: boolean = true;
    /**
     * Is open or not
     */
    get open(): boolean {
        return this._open;
    }

    /**
     * Reference
     */
    ref?: any;

    /**
     * Render setup / callback
     */
    renderSetup?: NotifictionRenderSetup;

    /**
     * Show the icon or hide it
     */
    showIcon?: boolean;

    /**
     * Seconds to auto dismiss
     */
    timespan: number;

    /**
     * Title
     */
    readonly title?: NotificationContent<UI>;

    /**
     * Type
     */
    readonly type: NotificationType;

    /**
     * Constructor
     * @param type Type
     * @param content Content
     * @param title Title
     * @param align Align
     * @param timespan Timespan
     */
    constructor(
        type: NotificationType,
        content: NotificationContent<UI>,
        title?: NotificationContent<UI>,
        align?: NotificationAlign,
        timespan?: number
    ) {
        this.id = Utils.newGUID();

        this.type = type;
        this.content = content;
        this.title = title;

        // Modal type
        this.modal = type in NotificationModalType;

        // Align, only available for none modal
        if (this.modal) this.align = NotificationAlign.Unknown;
        else if (align != null) this.align = align;
        // Message align default to top left
        else if (type in NotificationMessageType)
            this.align = NotificationAlign.TopLeft;
        else this.align = NotificationAlign.Center;

        // Display as modal will lasts otherwise 5 seconds to dismiss it
        this.timespan = timespan ?? (this.modal ? 0 : 5);
    }

    /**
     * Dismiss it
     * @param delaySeconds Delay seconds
     * @returns Is delayed or not
     */
    dismiss(delaySeconds: number = 0): boolean {
        // If it's closed, return
        if (!this._open) return false;

        if (delaySeconds > 0) {
            this.removeTimeout();
            this.dismissSeed = window.setTimeout(
                this.dismiss.bind(this),
                delaySeconds * 1000,
                0 // force to dismiss
            );
            return true;
        }

        // For message, call onReturn
        if (this.onReturn != null && this.type in NotificationMessageType) {
            this.onReturn(undefined);
        }

        // Indicate closed
        this._open = false;

        if (this.onDismiss) this.onDismiss();

        this.dispose();

        return false;
    }

    // Remove possible dismiss timeout
    private removeTimeout() {
        if (this.dismissSeed > 0) {
            clearTimeout(this.dismissSeed);
            this.dismissSeed = 0;
        }
    }

    /**
     * Dispose it
     */
    dispose() {
        this.removeTimeout();
    }

    /**
     * Render method
     * @param props Props, provider's UI props
     * @param className Style class name
     */
    abstract render(
        props: NotificationRenderProps,
        className?: string
    ): UI | undefined;

    /**
     * Return value
     * Dismiss first, then run callback
     * @param value
     * @returns
     */
    async returnValue(value: any) {
        if (this.onReturn) {
            const result = await this.onReturn(value);
            if (result === false) return;
        }
        this.dismiss();
    }
}
