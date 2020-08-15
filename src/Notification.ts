import { NewGUID } from './Utils';

/**
 * Display align
 */
export enum NotificationAlign {
    TopLeft,
    TopCenter,
    TopRight,

    MiddleLeft,
    Center,
    MiddleRight,

    BottomLeft,
    BottomCenter,
    BottomRight
}

/**
 * Predefined types
 */
export enum NotificationType {
    Default,
    Success,
    Warning,
    Info,
    Danger,
    Loading,
    Confirm,
    Prompt
}

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
 * On return callback
 * return false will prevent default action
 */
export interface NotificationReturn<T> {
    (value: T): boolean | void;
}

/**
 * Notification class
 * Generic parameter UI presents UI element type
 */
export abstract class Notification<UI> {
    /**
     * Display align
     */
    align: NotificationAlign;

    /**
     * Content
     */
    content: string | NotificationCreator<UI>;

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
     * Seconds to dismiss
     */
    timespan: number = 0;

    /**
     * Title
     */
    title?: string | NotificationCreator<UI>;

    /**
     * Type
     */
    type: NotificationType;

    /**
     * Constructor
     * @param type Type
     * @param content Content
     * @param title Title
     * @param align Align
     */
    constructor(
        type: NotificationType,
        content: string | NotificationCreator<UI>,
        title?: string | NotificationCreator<UI>,
        align?: NotificationAlign
    ) {
        this.id = NewGUID();

        this.type = type;
        this.content = content;
        this.title = title;
        this.align = align || NotificationAlign.Center;
    }

    /**
     * Dismiss it
     * @param delaySeconds Delay seconds
     * @returns Is delayed or not
     */
    dismiss(delaySeconds: number = 0): boolean {
        if (delaySeconds > 0) {
            this.removeTimeout();
            this.dismissSeed = window.setTimeout(
                this.dismiss.bind(this),
                delaySeconds * 1000,
                0 // force to dismiss
            );
            return true;
        }

        if (this.onDismiss) this.onDismiss();

        this.dispose();

        return false;
    }

    // Remove possible dismiss timeout
    private removeTimeout() {
        if (this.dismissSeed > 0) {
            window.clearTimeout(this.dismissSeed);
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
     * @param className Style class name
     */
    abstract render(className?: string): UI;
}
