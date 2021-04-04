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
        content: string | NotificationCreator<UI>,
        title?: string | NotificationCreator<UI>,
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
    add(notification: Notification<any>, top: boolean = false): void

    /**
     * Align all notification count
     * @param align Align
     */
    alignCount(align: NotificationAlign)

    /**
     * Align open notification count
     * @param align Align
     */
    alignOpenCount(align: NotificationAlign)

    /**
     * Add notification
     * @param notification Notification
     * @param top Is insert top
     */
    add(notification: INotification<UI>, top?: boolean): void

    /**
     * Report error
     * @param error Error message
     * @param callback Callback
     */
    alert(error: string, callback?: NotificationReturn<void>): void

    /**
     * Remove all closed notification
     */
    clear(): void

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
    ): void

    /**
     * Dispose all notifications
     */
    dispose(): void

    /**
     * Get notification with align and id
     * @param align Align
     * @param id Notification id
     */
    get(align: NotificationAlign, id: string): INotification<UI> | undefined

    /**
     * Get notification with id
     * @param id Notification id
     */
    getById(id: string): INotification<UI> | undefined

    /**
     * Hide loading
     */
    hideLoading(): void

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
    ): INotification<UI>

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
    ): void

    /**
     * Show loading
     * @param title Title
     */
    showLoading(title: string): void
```