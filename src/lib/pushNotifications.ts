// Lightweight wrapper around the browser Notifications API used to
// alert the user whenever a new badge is unlocked. No backend required.

import { notificationsMuted } from "@/lib/quietHours";

const PREF_KEY = "vital.badgeNotifications.v1";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!notificationsSupported()) return "denied";
  return Notification.permission;
}

export function notificationsEnabled(): boolean {
  if (!notificationsSupported()) return false;
  if (Notification.permission !== "granted") return false;
  try {
    return localStorage.getItem(PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setNotificationsPref(on: boolean) {
  try {
    localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission === "granted") {
    setNotificationsPref(true);
    return "granted";
  }
  if (Notification.permission === "denied") return "denied";
  try {
    const result = await Notification.requestPermission();
    if (result === "granted") setNotificationsPref(true);
    return result;
  } catch {
    return "denied";
  }
}

export function sendBadgeNotification(title: string, body: string, icon?: string) {
  if (!notificationsEnabled()) return;
  if (notificationsMuted()) return;
  try {
    const n = new Notification(title, {
      body,
      icon: icon ?? "/placeholder.svg",
      badge: "/placeholder.svg",
      tag: "vital-badge-unlock",
      silent: false,
    });
    setTimeout(() => n.close(), 8000);
  } catch {
    /* ignore */
  }
}
