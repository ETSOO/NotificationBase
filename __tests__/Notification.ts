import {
    INotification,
    Notification,
    NotificationAlign,
    NotificationMessageType,
    NotificationParameters,
    NotificationReturn,
    NotificationType
} from '../src/Notification';
import { NotificationContainer } from '../src/NotificationContainer';

// Class implementation for tests
class NotificationTest extends Notification<any> {
    /**
     * Render method
     * @param className Style class name
     */
    render(className?: string) {
        return {};
    }
}

class NotificationContainerTest extends NotificationContainer<any> {
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
    ): void {}

    /**
     * Hide loading
     */
    hideLoading(): void {}

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
    ): INotification<any> {
        return new NotificationTest(
            NotificationType.Warning,
            'Warning message will show'
        );
    }

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
    ): void {}

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
    ): void {}

    /**
     * Show loading
     * @param title Title
     */
    showLoading(title?: string): void {}
}

// Container
var container = new NotificationContainerTest((update) => {});

// Timer mock
// https://jestjs.io/docs/en/timer-mocks
jest.useFakeTimers();

test('Tests for notification dismiss', () => {
    // Arrange
    const n = new NotificationTest(NotificationType.Loading, 'Test');

    // Spy on the method
    const spy = jest.spyOn(n, 'dismiss');

    // Act
    n.dismiss(2);

    // Assert
    // setTimeout should be called 1 time
    expect(setTimeout).toBeCalled();

    // Fast forward
    jest.runOnlyPendingTimers();

    // dismiss should be called 2 times
    expect(spy).toBeCalledTimes(2);
});

test('Tests for notification container add', () => {
    // Arrange
    const n = new NotificationTest(NotificationType.Loading, 'Test');

    // Act
    container.add(n);

    // Fast forward
    jest.runOnlyPendingTimers();
});

test('Tests for notification container remove', (done) => {
    // Arrange
    // Reset
    container.dispose();

    // One notification
    const n = new NotificationTest(NotificationType.Loading, 'Test');
    n.onDismiss = () => {
        expect(container.isLoading).toBeFalsy();

        // New notification
        const newNotification = new NotificationTest(
            NotificationType.Prompt,
            'Prompt'
        );
        container.add(newNotification);

        // Fast forward
        jest.runOnlyPendingTimers();

        // Clear tests
        expect(container.alignCount(NotificationAlign.Unknown)).toBe(2);

        container.clear();

        expect(container.alignCount(NotificationAlign.Unknown)).toBe(1);

        done();
    };
    n.timespan = 3;

    // Act
    container.add(n);

    // Assert
    // Previous test added one but a new modal type will remove it
    expect(container.isLoading).toBeTruthy();
    expect(container.isModeling).toBeTruthy();

    // Fast forward
    jest.runOnlyPendingTimers();
});

jest.clearAllTimers();
