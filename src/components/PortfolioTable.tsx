import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const generateTableData = () => {
  const data = [];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  let previousValue = 100000;
  let startYearValue = 100000;
  const startDate = new Date(2021, 6); // July 2021
  const endDate = new Date();
  let currentDate = startDate;
  
  while (currentDate <= endDate) {
    const month = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    const value = previousValue * (1 + (Math.random() * 0.1 - 0.03));
    
    if (month === "Jan") {
      startYearValue = value;
    }
    
    const netFlow = Math.random() > 0.5 ? Math.round(Math.random() * 5000) : -Math.round(Math.random() * 5000);
    const monthlyGain = value - previousValue - netFlow;
    const monthlyReturn = (monthlyGain / previousValue) * 100;
    const ytdGain = value - startYearValue;
    const ytdReturn = (ytdGain / startYearValue) * 100;
    
    data.push({
      month: `${month} ${year}`,
      value: Math.round(value),
      netFlow: netFlow,
      monthlyGain: Math.round(monthlyGain),
      monthlyReturn: monthlyReturn.toFixed(2),
      ytdGain: Math.round(ytdGain),
      ytdReturn: ytdReturn.toFixed(2),
    });
    
    previousValue = value;
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return data.reverse(); // Return in descending order
};

const PortfolioTable = () => {
  const data = generateTableData();

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Monthly Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Net Flows</TableHead>
                <TableHead className="text-right">Monthly Gain</TableHead>
                <TableHead className="text-right">Monthly Return</TableHead>
                <TableHead className="text-right">YTD Gain</TableHead>
                <TableHead className="text-right">YTD Return</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="font-medium">{row.month}</TableCell>
                  <TableCell className="text-right">
                    ${row.value.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={row.netFlow >= 0 ? "text-green-600" : "text-red-600"}>
                      ${row.netFlow.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={row.monthlyGain >= 0 ? "text-green-600" : "text-red-600"}>
                      ${row.monthlyGain.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={Number(row.monthlyReturn) >= 0 ? "text-green-600" : "text-red-600"}>
                      {row.monthlyReturn}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={row.ytdGain >= 0 ? "text-green-600" : "text-red-600"}>
                      ${row.ytdGain.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={Number(row.ytdReturn) >= 0 ? "text-green-600" : "text-red-600"}>
                      {row.ytdReturn}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioTable;