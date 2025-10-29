import { describe, expect, it } from "vitest";

import { isAdminEditableStatus } from "./utils";

describe("isAdminEditableStatus", () => {
  it("returns false while survey is idle", () => {
    expect(isAdminEditableStatus("idle")).toBe(false);
  });

  it("returns true while survey is in progress", () => {
    expect(isAdminEditableStatus("inProgress")).toBe(true);
  });

  it("returns true when survey is completed", () => {
    expect(isAdminEditableStatus("completed")).toBe(true);
  });

  it("returns true when survey is in error state", () => {
    expect(isAdminEditableStatus("error")).toBe(true);
  });
});
