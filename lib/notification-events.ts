export function dispatchUnreadChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("notification-change"));
  }
}
