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
 * Notification UI type
 */
export interface NotificationUI<UI> {
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
 */
export interface NotificationReturn {
    <T>(value: T): boolean;
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
    content: string | NotificationUI<UI>;

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
    onReturn?: NotificationReturn;

    /**
     * Show the icon or hide it
     */
    showIcon?: boolean;

    /**
     * Seconds to dismiss
     */
    timespan: number = 5;

    /**
     * Title
     */
    title?: string | NotificationUI<UI>;

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
        content: string | NotificationUI<UI>,
        title?: string | NotificationUI<UI>,
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
    dismiss(delaySeconds: number): boolean {
        if (this.onDismiss) {
            if (delaySeconds > 0) {
                this.removeTimeout();
                this.dismissSeed = window.setTimeout(
                    this.dismiss.bind(this),
                    delaySeconds * 1000
                );
                return true;
            }

            this.onDismiss();
        }

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
