export const NOTIFICATION_STATUS_ENABLED = "enabled";
export const NOTIFICATION_STATUS_DISABLED = "disabled";

export class NotificationState {
  constructor(private enabled: boolean) {}

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  toggle(): void {
    this.enabled = !this.enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  statusText(): string {
    return this.enabled ? NOTIFICATION_STATUS_ENABLED : NOTIFICATION_STATUS_DISABLED;
  }
}
