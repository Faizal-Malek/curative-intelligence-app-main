// Notification and Activity Log Service
// Provides helper functions to create notifications and log activities for users and owners

import { prisma } from '@/lib/prisma';

/**
 * Notification Types (matching schema enum)
 */
export type NotificationType = 'SYSTEM' | 'ADMIN_MESSAGE' | 'ANNOUNCEMENT' | 'WARNING' | 'SUCCESS';

/**
 * Activity Log Actions (matching schema enum)
 */
export type ActivityAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_POST'
  | 'EDIT_POST'
  | 'DELETE_POST'
  | 'UPDATE_PROFILE'
  | 'UPDATE_PAYMENT_STATUS'
  | 'SEND_PAYMENT_REMINDER'
  | 'UPDATE_NAVIGATION'
  | 'SUSPEND_USER'
  | 'ACTIVATE_USER'
  | 'CHANGE_PLAN'
  | 'GENERATE_CONTENT'
  | 'CONNECT_SOCIAL'
  | 'DISCONNECT_SOCIAL';

/**
 * Create a notification for a user
 */
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  createdBy?: string;
  actionUrl?: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        createdBy: params.createdBy,
        actionUrl: params.actionUrl,
        isRead: false,
      },
    });

    return { success: true, notification };
  } catch (error) {
    console.error('Failed to create notification:', error);
    return { success: false, error };
  }
}

/**
 * Create multiple notifications at once (bulk)
 */
export async function createBulkNotifications(
  notifications: Array<{
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    createdBy?: string;
    actionUrl?: string;
  }>
) {
  try {
    const created = await prisma.notification.createMany({
      data: notifications.map((n) => ({
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        createdBy: n.createdBy,
        actionUrl: n.actionUrl,
        isRead: false,
      })),
    });

    return { success: true, count: created.count };
  } catch (error) {
    console.error('Failed to create bulk notifications:', error);
    return { success: false, error };
  }
}

/**
 * Get unread notifications for a user
 */
export async function getUnreadNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return { success: true, notifications };
  } catch (error) {
    console.error('Failed to get unread notifications:', error);
    return { success: false, error, notifications: [] };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return { success: false, error };
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { success: true, count: result.count };
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return { success: false, error };
  }
}

/**
 * Log user activity
 */
export async function logActivity(params: {
  userId: string;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, any>;
}) {
  try {
    const log = await prisma.activityLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        description: params.description,
        metadata: params.metadata as any,
      },
    });

    return { success: true, log };
  } catch (error) {
    console.error('Failed to log activity:', error);
    return { success: false, error };
  }
}

/**
 * Get recent activity logs for a user
 */
export async function getUserActivityLogs(userId: string, limit = 50) {
  try {
    const logs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return { success: true, logs };
  } catch (error) {
    console.error('Failed to get activity logs:', error);
    return { success: false, error, logs: [] };
  }
}

/**
 * Get all activity logs (for owners/admins)
 */
export async function getAllActivityLogs(limit = 100) {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return { success: true, logs };
  } catch (error) {
    console.error('Failed to get all activity logs:', error);
    return { success: false, error, logs: [] };
  }
}

/**
 * Notification Templates for Common Actions
 */
export const NotificationTemplates = {
  welcomeUser: (userName: string) => ({
    type: 'SUCCESS' as NotificationType,
    title: 'Welcome to Curative! 🎉',
    message: `Hi ${userName}! Your workspace is ready. Let's start creating amazing content together.`,
  }),

  workspaceGenerated: (contentCount: number, templateCount: number) => ({
    type: 'SUCCESS' as NotificationType,
    title: 'Your Workspace is Ready! ✨',
    message: `We've generated ${contentCount} personalized content ideas and ${templateCount} templates for you. Check your vault to get started!`,
  }),

  paymentReminder: (plan: string, amount: number, dueDate: string) => ({
    type: 'WARNING' as NotificationType,
    title: 'Payment Reminder 💳',
    message: `Your ${plan} plan subscription of $${amount} is due ${dueDate}. Please update your payment method to continue enjoying uninterrupted service.`,
  }),

  paymentConfirmed: (plan: string, amount: number) => ({
    type: 'SUCCESS' as NotificationType,
    title: 'Payment Received ✅',
    message: `Thank you! Your ${plan} plan payment of $${amount} has been received. Your subscription is active.`,
  }),

  navigationUpdated: () => ({
    type: 'SYSTEM' as NotificationType,
    title: 'Account Settings Updated',
    message: 'Your account navigation permissions have been updated by an administrator.',
  }),

  accountSuspended: (reason?: string) => ({
    type: 'WARNING' as NotificationType,
    title: 'Account Suspended ⚠️',
    message: reason || 'Your account has been suspended. Please contact support for more information.',
  }),

  accountActivated: () => ({
    type: 'SUCCESS' as NotificationType,
    title: 'Account Activated ✅',
    message: 'Your account has been reactivated. Welcome back!',
  }),

  planUpgraded: (newPlan: string) => ({
    type: 'SUCCESS' as NotificationType,
    title: 'Plan Upgraded! 🚀',
    message: `Congratulations! Your account has been upgraded to ${newPlan}. Enjoy your new features!`,
  }),

  contentGenerated: (count: number) => ({
    type: 'SUCCESS' as NotificationType,
    title: 'Content Ready! 📝',
    message: `${count} new content ${count === 1 ? 'piece' : 'pieces'} generated and added to your vault.`,
  }),

  socialConnected: (platform: string) => ({
    type: 'SUCCESS' as NotificationType,
    title: 'Social Media Connected 🔗',
    message: `Your ${platform} account has been successfully connected. You can now schedule posts!`,
  }),

  socialDisconnected: (platform: string) => ({
    type: 'INFO' as NotificationType,
    title: 'Social Media Disconnected',
    message: `Your ${platform} account has been disconnected.`,
  }),
};

/**
 * Activity Log Templates for Common Actions
 */
export const ActivityTemplates = {
  userLogin: (email: string) => ({
    action: 'LOGIN' as ActivityAction,
    description: `User ${email} logged in`,
  }),

  postCreated: (platform: string) => ({
    action: 'CREATE_POST' as ActivityAction,
    description: `Created new post for ${platform}`,
  }),

  paymentStatusUpdated: (targetEmail: string, status: string) => ({
    action: 'UPDATE_PAYMENT_STATUS' as ActivityAction,
    description: `Updated payment status for ${targetEmail} to ${status}`,
  }),

  navigationUpdated: (targetEmail: string) => ({
    action: 'UPDATE_NAVIGATION' as ActivityAction,
    description: `Updated navigation permissions for ${targetEmail}`,
  }),

  userSuspended: (targetEmail: string) => ({
    action: 'SUSPEND_USER' as ActivityAction,
    description: `Suspended user account: ${targetEmail}`,
  }),

  userActivated: (targetEmail: string) => ({
    action: 'ACTIVATE_USER' as ActivityAction,
    description: `Activated user account: ${targetEmail}`,
  }),

  planChanged: (targetEmail: string, newPlan: string) => ({
    action: 'CHANGE_PLAN' as ActivityAction,
    description: `Changed plan for ${targetEmail} to ${newPlan}`,
  }),
};
