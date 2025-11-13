'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HiCheckCircle } from 'react-icons/hi'
import { formatCurrency } from '@/app/utils/format'

interface CreditMessage {
  id: string
  memberCode: string
  amount: number
  source: string
}

const CREDIT_SOURCES = [
  'received an investment payout of',
  'just claimed a reward of',
  'received wallet top-up of',
  'earned referral bonus of',
  'secured profit of',
]

const CREDIT_AMOUNTS = [
  2500, 3500, 5000, 7500, 8200, 10000, 12500, 15000, 20000, 24500, 30000, 45000, 50000, 65000, 75000,
]

const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function LiveCreditTicker() {
  const sources = useMemo(() => CREDIT_SOURCES, [])
  const amounts = useMemo(() => CREDIT_AMOUNTS, [])
  const [message, setMessage] = useState<CreditMessage>(() => generateMessage(sources, amounts))

  const cycleMessage = useCallback(() => {
    setMessage(generateMessage(sources, amounts))
  }, [sources, amounts])

  useEffect(() => {
    const interval = setInterval(() => {
      cycleMessage()
    }, 4000)

    return () => clearInterval(interval)
  }, [cycleMessage])

  return (
    <div className="theme-bg-secondary theme-border border rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm overflow-hidden">
      <div className="w-9 h-9 rounded-full bg-[#10b981]/15 text-[#10b981] flex items-center justify-center flex-shrink-0">
        <HiCheckCircle className="w-5 h-5" />
      </div>
      <div className="flex-1 overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-0.5"
          >
            <p className="text-sm font-medium theme-text-primary">
              Member{' '}
              <span className="px-1.5 py-0.5 rounded-md bg-[#8b5cf6]/15 text-[#7c3aed] font-semibold tracking-wide">
                ***{message.memberCode}
              </span>{' '}
              {message.source}{' '}
              <span className="font-semibold text-[#10b981]">{formatCurrency(message.amount)}</span>
            </p>
            <p className="text-xs theme-text-muted">Just now · live activity</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function generateMessage(sources: string[], amounts: number[]): CreditMessage {
  const memberNumber = getRandomInt(1, 999).toString().padStart(3, '0')
  const amount = amounts[getRandomInt(0, amounts.length - 1)]
  const source = sources[getRandomInt(0, sources.length - 1)]

  return {
    id: `${memberNumber}-${Date.now()}`,
    memberCode: memberNumber,
    amount,
    source,
  }
}

