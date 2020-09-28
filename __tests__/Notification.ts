import { NotificationContainer } from '../src/NotificationContainer';
import {
    Notification,
    NotificationAlign,
    NotificationType
} from '../src/Notification';

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

test('Tests for notification container add', (done) => {
    // Arrange
    const n = new NotificationTest(NotificationType.Loading, 'Test');

    const update = (notificationId: string) => {
        expect(notificationId).toBe(n.id);
        done();
    };

    NotificationContainer.register(update);

    // Act
    NotificationContainer.add(n);
});

test('Tests for notification container remove', (done) => {
    // Arrange
    // Reset
    NotificationContainer.dispose();

    // One notification
    const n = new NotificationTest(NotificationType.Loading, 'Test');
    n.onDismiss = () => {
        expect(NotificationContainer.isLoading).toBeFalsy();

        // New notification
        const newNotification = new NotificationTest(
            NotificationType.Prompt,
            'Prompt'
        );
        NotificationContainer.add(newNotification);

        // Clear tests
        expect(
            NotificationContainer.alignCount(NotificationAlign.Unknown)
        ).toBe(2);

        NotificationContainer.clear();

        expect(
            NotificationContainer.alignCount(NotificationAlign.Unknown)
        ).toBe(1);

        done();
    };
    n.timespan = 3;

    const update = (notificationId: string, dismiss: boolean) => {
        console.log(
            notificationId,
            NotificationContainer.get(NotificationAlign.Unknown, notificationId)
                ?.open,
            dismiss
        );
        if (dismiss) {
            expect(n.id).toBe(notificationId);
        }
        done();
    };

    NotificationContainer.register(update);

    // Act
    NotificationContainer.add(n);

    // Assert
    // Previous test added one but a new modal type will remove it
    expect(NotificationContainer.isLoading).toBeTruthy();
    expect(NotificationContainer.isModeling).toBeTruthy();

    // Fast forward
    jest.runOnlyPendingTimers();
});

jest.clearAllTimers();
