import { PayloadReader } from "./PayloadReader.js";

const STATUS_KEYS = ["status", "state", "result"];
const FAILURE_STATUSES = ["error", "failed", "failure", "fail"];

export class ToolExecutionResult {
  private constructor(public readonly failed: boolean) {}

  static fromPayload(payload: unknown): ToolExecutionResult {
    return new ToolExecutionResult(ToolExecutionResult.hasFailure(payload));
  }

  private static hasFailure(payload: unknown): boolean {
    const reader = new PayloadReader(payload);
    const record = reader.record();
    if (!record) return false;

    const status = reader.stringProperty(STATUS_KEYS);
    if (status && FAILURE_STATUSES.includes(status)) return true;
    if (typeof record.error === "string" || typeof record.error === "object") return true;
    if (typeof record.exitCode === "number" && record.exitCode !== 0) return true;

    return ToolExecutionResult.hasNestedOutputFailure(record.output);
  }

  private static hasNestedOutputFailure(output: unknown): boolean {
    const reader = new PayloadReader(output);
    const record = reader.record();
    if (!record) return false;

    const status = reader.stringProperty(STATUS_KEYS);
    if (status && FAILURE_STATUSES.includes(status)) return true;
    if (typeof record.error === "string" || typeof record.error === "object") return true;
    return typeof record.exitCode === "number" && record.exitCode !== 0;
  }
}
