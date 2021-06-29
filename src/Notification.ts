import { Utils } from '@etsoo/shared';

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
 * Notification UI creator
 */
export interface NotificationCreator<UI> {
    (): UI;
}

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
 * return false will prevent default action
 */
export interface NotificationReturn<T> {
    (value: T): boolean | void;
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
     * Time span to dismiss
     */
    timespan?: number;

    /**
     * Add to the top
     */
    top?: boolean;
}

/**
 * Notification render props
 */
export interface NotificationRenderProps {}

/**
 * Notification base interface
 */
export interface INotificaseBase {
    /**
     * Display align
     */
    readonly align?: NotificationAlign;

    /**
     * Content
     */
    readonly content: string | NotificationCreator<any>;

    /**
     * Input or control properties
     */
    inputProps?: any;

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
     */
    renderSetup?: NotifictionRenderSetup;

    /**
     * Title
     */
    readonly title?: string | NotificationCreator<any>;

    /**
     * Type
     */
    readonly type: NotificationType;
}

/**
 * Notification interface
 */
export interface INotification<UI> extends INotificaseBase {
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
    readonly content: string | NotificationCreator<UI>;

    /**
     * Title
     */
    readonly title?: string | NotificationCreator<UI>;

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
    render(
        props: NotificationRenderProps,
        className?: string,
        options?: any
    ): UI | undefined;
}

/**
 * Notification class
 * Generic parameter UI presents UI element type
 */
export abstract class Notification<UI> implements INotification<UI> {
    /**
     * Display align
     */
    readonly align: NotificationAlign;

    /**
     * Content
     */
    readonly content: string | NotificationCreator<UI>;

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
    inputProps?: any;

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
    onReturn?: NotificationReturn<any>;

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
    readonly title?: string | NotificationCreator<UI>;

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
        content: string | NotificationCreator<UI>,
        title?: string | NotificationCreator<UI>,
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
            this.dismissSeed = setTimeout(
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
     * @param props Props
     * @param className Style class name
     * @param options Other options
     */
    abstract render(
        props: NotificationRenderProps,
        className?: string,
        options?: any
    ): UI | undefined;
}
