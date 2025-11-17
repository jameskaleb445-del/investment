"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { formatCurrency } from "@/app/utils/format"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/components/ui/chart"

interface EarningsChartProps {
  data: Array<{
    date: string
    earnings: number
  }>
}

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "#8b5cf6",
  },
} satisfies ChartConfig

export function EarningsChart({ data }: EarningsChartProps) {
  // Format Y-axis values as USD
  const formatYAxisTick = (value: number) => {
    return `$${value}`
  }

  // Format tooltip - data comes in USD, convert back to XAF for display
  const formatTooltipValue = (value: number) => {
    const xafValue = value * 600 // Convert USD to XAF
    return formatCurrency(xafValue)
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[120px] w-full"
    >
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          left: 0,
          right: 0,
          top: 5,
          bottom: 5,
        }}
      >
        <CartesianGrid 
          vertical={false} 
          stroke="#2d2d35" 
          strokeDasharray="3 3"
          opacity={0.5}
        />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tick={{ fill: "#707079", fontSize: 10 }}
        />
        <YAxis
          hide={true}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="w-[150px] !theme-bg-secondary !theme-border !theme-text-primary z-[9999]"
              nameKey="earnings"
              labelFormatter={(value) => {
                return value
              }}
              formatter={(value: any) => {
                return formatTooltipValue(value)
              }}
            />
          }
        />
        <Line
          dataKey="earnings"
          type="linear"
          stroke="#8b5cf6"
          strokeWidth={2.5}
          dot={{ fill: "#8b5cf6", r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#a78bfa", strokeWidth: 0 }}
          connectNulls={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
