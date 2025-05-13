"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, } from "@/components/ui/chart"
import { Pressure } from "./Query"

const chartData = [
  { timestamp: "2025-05-03T12:32:26.321Z", pressure: 186, mobile: 80 },
  { timestamp: "2025-05-03T12:32:27.821Z", pressure: 305, mobile: 200 },
  { timestamp: "2025-05-03T12:32:29.321Z", pressure: 237, mobile: 120 },
  { timestamp: "2025-05-03T12:32:30.821Z", pressure: 73, mobile: 190 },
  { timestamp: "2025-05-03T12:32:32.321Z", pressure: 209, mobile: 130 },
]

const chartConfig = {
  pressure: {
    label: "Pressure",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

function ChartRecall({ data }: { data: Pressure[] }) {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pressure Chart - Label</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              label={{
                value: 'Pressure (Pa)',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { textAnchor: 'middle' },
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="pressure"
              type="natural"
              stroke="var(--color-pressure)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-pressure)",
              }}
              activeDot={{
                r: 6,
              }}
            >
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default ChartRecall;