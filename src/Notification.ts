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
    Danger
}

/**
 * Notification UI type
 */
export interface NotificationUI<UI> {
    (): UI;
}

/**
 * Notification dismiss reasons
 */
export enum NotificationDismissReason {
    /**
     * Timespan auto dismiss
     */
    Auto,

    /**
     * Call method dismiss
     */
    Call,

    /**
     * User behavior
     */
    User
}

/**
 * On dismiss callback
 */
export interface NotificationDismiss {
    (reason: NotificationDismissReason): void;
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
     * Unique id
     */
    readonly id: string;

    /**
     * On dismiss handling
     */
    onDismiss?: NotificationDismiss;

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
    type?: NotificationType | string;

    /**
     * Constructor
     * @param content Content
     * @param title Title
     * @param align Align
     */
    constructor(
        content: string | NotificationUI<UI>,
        title?: string | NotificationUI<UI>,
        align?: NotificationAlign
    ) {
        this.id = NewGUID();

        this.content = content;
        this.title = title;
        this.align = align || NotificationAlign.Center;
    }

    /**
     * Dismiss it
     */
    abstract dismiss(): void;

    /**
     * Render method
     */
    abstract render(): UI;
}
