import { NotificationContainer } from '../src/NotificationContainer';
import { Notification, NotificationType } from '../src/Notification';

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

test('Tests for notification container', (done) => {
    // Arrange
    const n = new NotificationTest(NotificationType.Loading, 'Test');
    n.onDismiss = () => {
        done();
    };
    n.timespan = 5;

    const add = (notification: NotificationTest) => {
        expect(notification.content).toBe('Test');
        done();
    };

    const remove = (notificationId: string) => {
        expect(notificationId).toBe(n.id);
        done();
        return undefined;
    };

    NotificationContainer.register(add, remove);

    // Act
    NotificationContainer.add(n);

    // Fast forward
    jest.runOnlyPendingTimers();
});

jest.clearAllTimers();
