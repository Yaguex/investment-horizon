import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Loader2 } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type MacroData = {
  series_id: string;
  series_id_description: string;
  date: string;
  value_adjusted: number;
}

type ChartData = {
  date: string;
  value: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
        <p className="font-bold text-black">{payload[0].payload.date}</p>
        <p className={value > 0 ? "text-green-500" : "text-red-500"}>
          {value}
        </p>
      </div>
    );
  }
  return null;
};

const MiniChart = ({ data, title }: { data: ChartData[], title: string }) => {
  // Calculate min and max values from the dataset
  const values = data.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  // Calculate domain boundaries with proper 10% padding
  const padding = 0.1; // 10% padding
  const yAxisMin = minValue < 0 ? minValue * (1 + padding) : minValue * (1 - padding);
  const yAxisMax = maxValue < 0 ? maxValue * (1 - padding) : maxValue * (1 + padding);

  return (
    <div className="w-[150px] bg-white rounded-lg shadow p-2">
      <div className="text-xs font-medium mb-2 truncate text-[#777]" title={title}>
        {title}
      </div>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={data}>
          <XAxis dataKey="date" hide />
          <YAxis hide domain={[yAxisMin, yAxisMax]} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value">
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill="currentColor"
                className={entry.value > 0 ? "text-green-500" : "text-red-500"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const EconomicCalendar = () => {
  const { data: macroData, isLoading } = useQuery({
    queryKey: ['macro-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('macro_data')
        .select('series_id, series_id_description, date, value_adjusted')
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data as MacroData[];
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-8">
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  const getChartData = (seriesId: string): ChartData[] => {
    if (!macroData) return [];
    
    return macroData
      .filter(d => d.series_id === seriesId)
      .slice(-12)
      .map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: d.value_adjusted
      }));
  };

  const getSeriesDescription = (seriesId: string): string => {
    return macroData?.find(d => d.series_id === seriesId)?.series_id_description || seriesId;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <h1 className="text-3xl font-bold mb-8">Economic Calendar</h1>
        
        <div className="space-y-8">
          {Object.entries(bundles).map(([bundleTitle, seriesIds]) => (
            <div key={bundleTitle} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">{bundleTitle}</h2>
              <div className="flex flex-wrap gap-4">
                {seriesIds.map(seriesId => (
                  <MiniChart
                    key={seriesId}
                    data={getChartData(seriesId)}
                    title={getSeriesDescription(seriesId)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default EconomicCalendar;
