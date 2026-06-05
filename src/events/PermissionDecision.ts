import { PayloadReader } from "./PayloadReader.js";

export type PermissionDecisionValue = "allow" | "deny";

const DECISION_KEYS = ["status", "decision", "answer", "action", "result"];
const ALLOW_VALUES = ["allow", "allowed", "approve", "approved", "yes", "accept", "accepted"];
const DENY_VALUES = ["deny", "denied", "reject", "rejected", "no", "block", "blocked"];

export class PermissionDecision {
  private constructor(public readonly value: PermissionDecisionValue) {}

  static fromPayload(payload: unknown): PermissionDecision | undefined {
    const reader = new PayloadReader(payload);
    const value = reader.stringProperty(DECISION_KEYS) ?? reader.nestedStringProperty("event", DECISION_KEYS);

    if (!value) return undefined;
    if (ALLOW_VALUES.includes(value)) return new PermissionDecision("allow");
    if (DENY_VALUES.includes(value)) return new PermissionDecision("deny");
    return undefined;
  }
}
