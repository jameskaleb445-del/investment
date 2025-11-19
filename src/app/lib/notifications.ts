import { createClient, createAdminClient } from '@/app/lib/supabase/server'
import { formatCurrency } from '@/app/utils/format'
import { sendPushForNotification } from './send-push-notification'

export interface CreateNotificationParams {
  userId: string
  type:
    | 'deposit'
    | 'withdrawal'
    | 'investment'
    | 'investment_completed'
    | 'roi_payout'
    | 'referral_commission'
    | 'daily_reward'
    | 'transaction_completed'
    | 'transaction_failed'
    | 'project_update'
    | 'system'
  title: string
  message: string
  data?: {
    transaction_id?: string
    project_id?: string
    investment_id?: string
    amount?: number
    project_name?: string
    status?: string
    streak?: number
    [key: string]: any
  }
}

/**
 * Create a notification for a user
 * Uses SECURITY DEFINER function to bypass RLS
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  data,
}: CreateNotificationParams): Promise<string | null> {
  try {
    const adminClient = createAdminClient()
    
    const { data: notificationId, error } = await adminClient.rpc('create_notification', {
      p_user_id: userId,
      p_type: type,
      p_title: title,
      p_message: message,
      p_data: data || null,
    })

    if (error) {
      console.error('Error creating notification:', error)
      return null
    }

    // Send push notification in the background (don't wait for it)
    sendPushForNotification(userId, type, title, message, data).catch((err) => {
      console.error('Error sending push notification:', err)
      // Don't fail the notification creation if push fails
    })

    return notificationId
  } catch (error) {
    console.error('Error in createNotification:', error)
    return null
  }
}

/**
 * Helper function to create deposit notification
 */
export async function notifyDeposit(
  userId: string,
  amount: number,
  transactionId: string
) {
  return createNotification({
    userId,
    type: 'deposit',
    title: 'Deposit Received',
    message: `Your deposit of ${formatCurrency(amount)} has been received and is being processed.`,
    data: {
      transaction_id: transactionId,
      amount,
    },
  })
}

/**
 * Helper function to create withdrawal notification
 */
export async function notifyWithdrawal(
  userId: string,
  amount: number,
  status: string,
  transactionId: string
) {
  const statusText = status === 'completed' ? 'completed' : status === 'failed' ? 'failed' : 'updated'
  
  return createNotification({
    userId,
    type: 'withdrawal',
    title: 'Withdrawal Update',
    message: `Your withdrawal of ${formatCurrency(amount)} has been ${statusText}.`,
    data: {
      transaction_id: transactionId,
      amount,
      status,
    },
  })
}

/**
 * Helper function to create investment notification
 */
export async function notifyInvestment(
  userId: string,
  amount: number,
  projectName: string,
  projectId: string,
  investmentId: string
) {
  return createNotification({
    userId,
    type: 'investment',
    title: 'Investment Confirmed',
    message: `Your investment of ${formatCurrency(amount)} in ${projectName} has been confirmed.`,
    data: {
      transaction_id: investmentId,
      project_id: projectId,
      investment_id: investmentId,
      amount,
      project_name: projectName,
    },
  })
}

/**
 * Helper function to create daily reward notification
 */
export async function notifyDailyReward(
  userId: string,
  amount: number,
  streak: number
) {
  return createNotification({
    userId,
    type: 'daily_reward',
    title: 'Daily Reward Claimed',
    message: `You've claimed ${formatCurrency(amount)} as your daily reward. ${streak} day streak!`,
    data: {
      amount,
      streak,
    },
  })
}

/**
 * Helper function to create ROI payout notification
 */
export async function notifyROIPayout(
  userId: string,
  amount: number,
  projectName?: string,
  projectId?: string
) {
  return createNotification({
    userId,
    type: 'roi_payout',
    title: 'ROI Payout',
    message: projectName
      ? `You've received ${formatCurrency(amount)} in returns from your investment in ${projectName}.`
      : `You've received ${formatCurrency(amount)} in returns from your investment.`,
    data: {
      amount,
      project_id: projectId,
      project_name: projectName,
    },
  })
}

/**
 * Helper function to create referral commission notification
 */
export async function notifyReferralCommission(
  userId: string,
  amount: number,
  level: number
) {
  return createNotification({
    userId,
    type: 'referral_commission',
    title: 'Referral Commission',
    message: `You've earned ${formatCurrency(amount)} in referral commission (Level ${level}).`,
    data: {
      amount,
      level,
    },
  })
}

/**
 * Helper function to create transaction status notification
 */
export async function notifyTransactionStatus(
  userId: string,
  amount: number,
  status: 'completed' | 'failed',
  transactionId: string
) {
  return createNotification({
    userId,
    type: status === 'completed' ? 'transaction_completed' : 'transaction_failed',
    title: status === 'completed' ? 'Transaction Completed' : 'Transaction Failed',
    message:
      status === 'completed'
        ? `Your transaction of ${formatCurrency(amount)} has been completed successfully.`
        : `Your transaction of ${formatCurrency(amount)} has failed. Please try again.`,
    data: {
      transaction_id: transactionId,
      amount,
      status,
    },
  })
}

