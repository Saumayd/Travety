import { beforeEach, describe, expect, it } from "vitest";
import { dashStore, unreadCount } from "@/lib/dash-store";
import { DASH_NOTIFICATIONS, outingsBy } from "@/data/outings";

describe("dashboard mock state", () => {
  beforeEach(() => dashStore.reset());

  it("marking one notification read lowers the unread count by one", () => {
    const before = unreadCount(dashStore.get());
    dashStore.markRead(DASH_NOTIFICATIONS[0]!.id);
    expect(unreadCount(dashStore.get())).toBe(before - 1);
  });

  it("mark all read clears the unread indicator", () => {
    dashStore.markAllRead();
    expect(unreadCount(dashStore.get())).toBe(0);
  });

  it("invitation notifications point at a received invite", () => {
    const inv = DASH_NOTIFICATIONS.find((n) => n.kind === "invite");
    expect(inv?.inviteId).toBe("inv-r1");
  });

  it("has exactly one active outing shared by dashboard and calendar", () => {
    expect(outingsBy("active")).toHaveLength(1);
  });
});
