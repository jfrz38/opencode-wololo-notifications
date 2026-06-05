import { EventKey } from "./EventKey.js";
import { PermissionDecision } from "./PermissionDecision.js";
import { ToolExecutionResult } from "./ToolExecutionResult.js";

export class EventClassifier {
  keysFor(eventName: string, payload?: unknown): EventKey[] {
    if (eventName === "permission.replied") return this.permissionKeys(payload);
    if (eventName === "tool.execute.after") return this.toolExecutionKeys(payload);
    return [EventKey.fromString(eventName)];
  }

  private permissionKeys(payload: unknown): EventKey[] {
    const decision = PermissionDecision.fromPayload(payload);
    if (decision?.value === "allow") return [EventKey.fromString("permission.replied.allow"), EventKey.fromString("permission.replied")];
    if (decision?.value === "deny") return [EventKey.fromString("permission.replied.deny"), EventKey.fromString("permission.replied")];
    return [EventKey.fromString("permission.replied")];
  }

  private toolExecutionKeys(payload: unknown): EventKey[] {
    const result = ToolExecutionResult.fromPayload(payload);
    if (result.failed) return [EventKey.fromString("tool.execute.after.error"), EventKey.fromString("tool.execute.after")];
    return [EventKey.fromString("tool.execute.after.success"), EventKey.fromString("tool.execute.after")];
  }
}
