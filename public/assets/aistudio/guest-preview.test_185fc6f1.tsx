import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/lib/auth";

const mocks = vi.hoisted(() => ({ getSession: vi.fn(), from: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({ useRouter: () => router }));
const router = { invalidate: vi.fn() };
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: mocks.from,
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));

let auth: ReturnType<typeof useAuth> | undefined;
function Probe() {
  auth = useAuth();
  return <output>{auth.loading ? "loading" : auth.preview ? "preview" : "signed out"}</output>;
}
beforeEach(() => {
  window.sessionStorage.clear();
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({ data: { session: null } });
});
afterEach(cleanup);

describe("Guest preview", () => {
  it("allows preview without creating an auth session or reading private account data", async () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("signed out")).toBeInTheDocument());
    act(() => auth?.startPreview());
    expect(auth?.preview).toBe(true);
    expect(auth?.session).toBeNull();
    expect(mocks.from).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem("travity-preview")).toBe("1");
  });

  it("restores preview in the same tab and clears it on exit", async () => {
    window.sessionStorage.setItem("travity-preview", "1");
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("preview")).toBeInTheDocument());
    act(() => auth?.exitPreview());
    expect(auth?.preview).toBe(false);
    expect(window.sessionStorage.getItem("travity-preview")).toBeNull();
  });
});