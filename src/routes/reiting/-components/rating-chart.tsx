import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { RatingEvent, User } from "@/types/users";

interface Props {
  user: User
  stats: RatingEvent[]
}

export function PlayerRankingChangeGraph({ stats, user }: Props) {
  const chartData = stats.map((event, index) => {
    const date = new Date(event.timestamp);
    return {
      id: index,
      month: `${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`,
      fullDate: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      ratingPoints: user.rate_points + event.rate_points,
      weightPoints: user.rate_weigth + event.rate_weight,
      placementPoints: user.rate_pl_points + event.rate_pl_points,
      rateOrder: user.rate_order + event.rate_order,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-700 mb-2">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey === 'ratingPoints' ? 'RP' :
                entry.dataKey === 'weightPoints' ? 'WP' :
                  entry.dataKey === 'placementPoints' ? 'PP' : 'RO'}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0 pt-4">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 15,
                left: 5,
                bottom: 20,
              }}
            >
              <CartesianGrid vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "#777", fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#777" }}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                dataKey="ratingPoints"
                type="monotone"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2 }}
              />
              <Line
                dataKey="weightPoints"
                type="monotone"
                stroke="#059669"
                strokeWidth={3}
                dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#059669", strokeWidth: 2 }}
              />
              <Line
                dataKey="placementPoints"
                type="monotone"
                stroke="#dc2626"
                strokeWidth={3}
                dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#dc2626", strokeWidth: 2 }}
              />
              <Line
                dataKey="rateOrder"
                type="monotone"
                stroke="#7c3aed"
                strokeWidth={3}
                dot={{ fill: "#7c3aed", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#7c3aed", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}