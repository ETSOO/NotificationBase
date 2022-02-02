# NotificationBase
**TypeScript notification component for extending with all features described and partially implemented.**

## Installing

Using npm:

```bash
$ npm install @etsoo/notificationbase
```

Using yarn:

```bash
$ yarn add @etsoo/notificationbase
```

## Notification
Notification object to display. INotification is the interface. INotificationBase is for data definition.

Properties:

|Name|Description|
|---:|---|
|align|Readonly, display align|
|content|Content to display|
|id|Unique id|
|inputProps|Input or additional control properties|
|modal|Display as modal window or not|
|onDismiss|Dismiss callback|
|onReturn|Return value callback|
|open|Is open or not|
|ref|Render result reference|
|renderSetup|Setup callback before render|
|showIcon|Show icon or not|
|timespan|Seconds to auto dismiss|
|title|Title|
|type|Notification type|

Methods:

```ts
    /**
     * Constructor
     * @param type Type
     * @param content Content
     * @param title Title
     * @param align Align
     */
    constructor(
        type: NotificationType,
        content: NotificationContent<UI>,
        title?: NotificationContent<UI>,
        align?: NotificationAlign
    )

    /**
     * Dismiss it
     * @param delaySeconds Delay seconds
     * @returns Is delayed or not
     */
    dismiss(delaySeconds: number = 0): boolean

    /**
     * Dispose it
     */
    dispose()

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
```


## NotificationContainer
NotificationContainer is to hold all notifications. INotificationContainer is the interface.

Properties:

|Name|Description|
|---:|---|
|notifications|Readonly. Notification collection to display|
|isLoading|Is loading bar showing|
|isModeling|Is model window showing|

Methods:

```ts
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
        error: NotificationContent<UI> | [NotificationContent<UI>, NotificationContent<UI>],
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
     * Prompt action
     * @param message Message
     * @param callback Callback
     * @param title Title
     * @param props More properties
     */
    prompt<T = string>(
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
```