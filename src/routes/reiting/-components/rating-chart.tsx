import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Brush } from "recharts"

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

  let user_base_rp = user.rate_points
  let user_base_wp = user.rate_weigth
  let user_rate_order = user.rate_order
  let user_rate_pl_points = user.rate_pl_points

  // Create full dataset first
  const fullChartData = stats.map((event, index) => {
    const date = new Date(event.timestamp);
    if (event.is_delta) {
      user_base_rp += event.rate_points
      user_base_wp += event.rate_weight;
      user_rate_order += event.rate_order
      user_rate_pl_points += event.rate_pl_points
    } else {
      user_base_rp = event.rate_points
      user_base_wp = event.rate_weight;
      user_rate_order = event.rate_order
      user_rate_pl_points = event.rate_pl_points
    }
    return {
      id: index,
      timestamp: date.getTime(),
      month: `${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`,
      fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ratingPoints: user_base_rp,
      weightPoints: user_base_wp,
      placementPoints: user_rate_pl_points,
      rateOrder: user_rate_order,
    };
  });


  // Enhanced sample data function that adjusts based on selection size
  const sampleData = (data: typeof fullChartData, maxPoints: number = 25) => {
    if (data.length <= maxPoints) return data;

    const step = Math.floor(data.length / maxPoints);
    const sampled = [];

    // Always include first point
    sampled.push(data[0]);

    // Sample intermediate points
    for (let i = step; i < data.length - step; i += step) {
      sampled.push(data[i]);
    }

    //always last point
    if (data.length > 1) {
      sampled.push(data[data.length - 1]);
    }

    return sampled;
  };

  const getChartData = () => {
    return sampleData(fullChartData);
  };


  const chartData = getChartData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
          <p className="font-medium text-gray-900 mb-2">{data?.fullDate}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm font-medium" style={{ color: entry.color }}>
                  {entry.dataKey === 'ratingPoints' ? 'Rating Points' :
                    entry.dataKey === 'weightPoints' ? 'Weight Points' :
                      entry.dataKey === 'placementPoints' ? 'Placement Points' : 'Rate Order'}:
                </span>
                <span className="text-sm font-bold ml-2" style={{ color: entry.color }}>
                  {Math.round(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0 pt-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              // key={"key"}
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 30,
              }}
            >
              <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fill: "#64748b", fontSize: 11 }}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              {/* Left Y-axis for RP, WP, PP (0-100 range) */}
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                width={30}
                tickFormatter={(value) => Math.round(value).toString()}
                domain={[0, 'dataMax + 10']}
              />
              {/* Right Y-axis for RO (0-700 range) */}
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#7c3aed", fontSize: 11 }}
                width={30}
                tickFormatter={(value) => Math.round(value).toString()}
                domain={[0, 'dataMax + 20']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                yAxisId="left"
                dataKey="ratingPoints"
                type="monotone"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: "#2563eb", strokeWidth: 2, fill: "#ffffff" }}
              />
              <Line
                yAxisId="left"
                dataKey="weightPoints"
                type="monotone"
                stroke="#059669"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: "#059669", strokeWidth: 2, fill: "#ffffff" }}
              />
              <Line
                yAxisId="left"
                dataKey="placementPoints"
                type="monotone"
                stroke="#dc2626"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: "#dc2626", strokeWidth: 2, fill: "#ffffff" }}
              />
              <Line
                yAxisId="right"
                dataKey="rateOrder"
                type="monotone"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: "#7c3aed", strokeWidth: 2, fill: "#ffffff" }}
              />

              <Brush
                dataKey="month"
                height={30}
                stroke="#8884d8"
                travellerWidth={12}
              />

            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}