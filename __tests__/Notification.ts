import { DataTypes } from "@etsoo/shared";
import {
  INotificaseBase,
  INotification,
  Notification,
  NotificationAlign,
  NotificationCallProps,
  NotificationRenderProps,
  NotificationType
} from "../src/Notification";
import { NotificationContainer } from "../src/NotificationContainer";

// Class implementation for tests
class NotificationTest extends Notification<any, NotificationCallProps> {
  render(props: NotificationRenderProps, className?: string, options?: any) {
    throw new Error("Method not implemented.");
  }
}

class NotificationContainerTest extends NotificationContainer<
  any,
  NotificationCallProps
> {
  protected addRaw(
    data: INotificaseBase<any, NotificationCallProps>
  ): INotification<any, NotificationCallProps> {
    throw new Error("Method not implemented.");
  }
}

// Container
var container = new NotificationContainerTest((update) => {});

// Timer mock
// https://jestjs.io/docs/en/timer-mocks
jest.useFakeTimers();

test("Tests for basic data", () => {
  expect(Object.keys(container.notifications).length).toBe(
    DataTypes.getEnumKeys(NotificationAlign).length
  );
});

test("Tests for notification dismiss", () => {
  // Arrange
  const n = new NotificationTest(NotificationType.Loading, "Test");

  // Spy on the method
  const spy = jest.spyOn(n, "dismiss");

  // Act
  n.dismiss(2);

  // Fast forward
  jest.runOnlyPendingTimers();

  // dismiss should be called 2 times
  expect(spy).toHaveBeenCalledTimes(2);
});

test("Tests for notification container add", () => {
  // Arrange
  const n = new NotificationTest(NotificationType.Loading, "Test");

  // Act
  container.add(n);

  // One item added
  expect(container.alignCount(n.align)).toBe(1);

  // Dismiss will remove the item at once
  n.dismiss();
  expect(container.alignCount(n.align)).toBe(0);
  expect(n.open).toBe(false);

  // Fast forward
  jest.runOnlyPendingTimers();

  // Will be totally removed from the collection
  expect(container.alignCount(n.align)).toBe(0);
});

test("Tests for notification container remove", (done) => {
  // Arrange
  // Reset
  container.dispose();

  // One notification
  const n = new NotificationTest(NotificationType.Loading, "Test");
  n.onDismiss = () => {
    expect(container.isLoading).toBeFalsy();

    // New notification
    const newNotification = new NotificationTest(
      NotificationType.Prompt,
      "Prompt"
    );
    container.add(newNotification);

    // Fast forward
    jest.runOnlyPendingTimers();

    // Clear tests
    expect(container.alignCount(NotificationAlign.Unknown)).toBe(1);

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
