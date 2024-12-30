import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export const MacroDataTest = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Query to fetch macro data
  const { data: macroData, refetch } = useQuery({
    queryKey: ['macro-data'],
    queryFn: async () => {
      console.log('Fetching macro data from database');
      const { data, error } = await supabase
        .from('macro_data')
        .select('*')
        .order('series_id', { ascending: true });

      if (error) {
        console.error('Error fetching macro data:', error);
        throw error;
      }

      console.log('Macro data fetched:', data);
      return data;
    }
  });

  // Query to fetch logs
  const { data: logs, refetch: refetchLogs } = useQuery({
    queryKey: ['macro-data-logs'],
    queryFn: async () => {
      console.log('Fetching macro data logs');
      const { data, error } = await supabase
        .from('macro_data_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching logs:', error);
        throw error;
      }

      console.log('Logs fetched:', data);
      return data;
    }
  });

  const handleFetchData = async () => {
    try {
      setIsLoading(true);
      console.log('Invoking fetch-fred-data function');
      
      const { data, error } = await supabase.functions.invoke('fetch-fred-data');
      
      if (error) {
        console.error('Error invoking function:', error);
        throw error;
      }

      console.log('Function response:', data);
      
      // Refetch the data to show updated results
      await Promise.all([refetch(), refetchLogs()]);
      
      toast({
        title: "Success",
        description: "FRED data fetch completed successfully",
      });
    } catch (error) {
      console.error('Error in handleFetchData:', error);
      toast({
        title: "Error",
        description: "Failed to fetch FRED data. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>FRED Data Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleFetchData} 
            disabled={isLoading}
          >
            {isLoading ? "Fetching..." : "Fetch FRED Data"}
          </Button>
        </CardContent>
      </Card>

      {/* Display the latest logs */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs?.map((log) => (
              <div 
                key={log.id}
                className="p-2 border rounded"
              >
                <p><strong>Series:</strong> {log.series_id}</p>
                <p><strong>Status:</strong> {log.status}</p>
                <p><strong>Message:</strong> {log.message || 'N/A'}</p>
                <p><strong>Time:</strong> {new Date(log.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Display the macro data */}
      <Card>
        <CardHeader>
          <CardTitle>Macro Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {macroData?.map((item) => (
              <div 
                key={item.id}
                className="p-2 border rounded"
              >
                <p><strong>Series:</strong> {item.series_id}</p>
                <p><strong>Description:</strong> {item.series_id_description}</p>
                <p><strong>Value:</strong> {item.value}</p>
                <p><strong>Last Update:</strong> {item.last_update}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};