import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface TradeEntry {
  id: number;
  quantity: number;
  entryDate: string;
  exitDate?: string;
  priceEntry: number;
  priceExit?: number;
}

interface Trade {
  id: number;
  ticker: string;
  bias: string;
  dateEntry: string;
  dateExpiration: string;
  dateExit?: string;
  strikeStart: number;
  strikeEnd: number;
  premium: number;
  stockPrice: number;
  riskPercentage: number;
  riskAmount: number;
  commission: number;
  pnl: number;
  roi: number;
  yearlyRoi: number;
  roiPortfolio: number;
  breakeven0: number;
  breakeven1: number;
  breakeven2: number;
  delta: number;
  iv: number;
  ivPercentile: number;
  notes: string;
  entries: TradeEntry[];
}

// Mock data
const mockTrades: Trade[] = [
  {
    id: 1,
    ticker: "AAPL",
    bias: "Bullish",
    dateEntry: "2024-01-15",
    dateExpiration: "2024-02-15",
    strikeStart: 180,
    strikeEnd: 190,
    premium: 2.5,
    stockPrice: 185,
    riskPercentage: 5,
    riskAmount: 500,
    commission: 1.5,
    pnl: 250,
    roi: 12.5,
    yearlyRoi: 150,
    roiPortfolio: 0.5,
    breakeven0: 182.5,
    breakeven1: 187.5,
    breakeven2: 192.5,
    delta: 0.45,
    iv: 25,
    ivPercentile: 45,
    notes: "Strong technical setup",
    entries: [
      {
        id: 1,
        quantity: 2,
        entryDate: "2024-01-15",
        priceEntry: 2.5,
      },
      {
        id: 2,
        quantity: 1,
        entryDate: "2024-01-20",
        priceEntry: 3.0,
      }
    ]
  },
  // Add more mock trades as needed
];

interface TradeLogTableProps {
  status: "open" | "closed";
}

const TradeLogTable = ({ status }: TradeLogTableProps) => {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const toggleRow = (tradeId: number) => {
    setExpandedRows(prev =>
      prev.includes(tradeId)
        ? prev.filter(id => id !== tradeId)
        : [...prev, tradeId]
    );
  };

  const isRowExpanded = (tradeId: number) => expandedRows.includes(tradeId);

  return (
    <Card className="animate-fade-in mt-4">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead>Bias</TableHead>
                <TableHead>QTY</TableHead>
                <TableHead>Date Entry</TableHead>
                <TableHead>Date Expiration</TableHead>
                <TableHead>Date Exit</TableHead>
                <TableHead>Days in Trade</TableHead>
                <TableHead>Strike Start</TableHead>
                <TableHead>Strike End</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Stock Price</TableHead>
                <TableHead>Risk %</TableHead>
                <TableHead>Risk $</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>PnL</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>Yearly ROI</TableHead>
                <TableHead>ROI Portfolio</TableHead>
                <TableHead>B/E 0</TableHead>
                <TableHead>B/E 1</TableHead>
                <TableHead>B/E 2</TableHead>
                <TableHead>Delta</TableHead>
                <TableHead>IV</TableHead>
                <TableHead>IV Percentile</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTrades.map(trade => (
                <>
                  <TableRow 
                    key={trade.id}
                    className="bg-yellow-50 hover:bg-yellow-100 cursor-pointer"
                    onClick={() => toggleRow(trade.id)}
                  >
                    <TableCell>
                      {isRowExpanded(trade.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell>{trade.ticker}</TableCell>
                    <TableCell>{trade.bias}</TableCell>
                    <TableCell>{trade.entries.reduce((sum, entry) => sum + entry.quantity, 0)}</TableCell>
                    <TableCell>{trade.dateEntry}</TableCell>
                    <TableCell>{trade.dateExpiration}</TableCell>
                    <TableCell>{trade.dateExit || '-'}</TableCell>
                    <TableCell>
                      {trade.dateExit 
                        ? Math.floor((new Date(trade.dateExit).getTime() - new Date(trade.dateEntry).getTime()) / (1000 * 60 * 60 * 24))
                        : Math.floor((new Date().getTime() - new Date(trade.dateEntry).getTime()) / (1000 * 60 * 60 * 24))
                      }
                    </TableCell>
                    <TableCell>${trade.strikeStart}</TableCell>
                    <TableCell>${trade.strikeEnd}</TableCell>
                    <TableCell>${trade.premium}</TableCell>
                    <TableCell>${trade.stockPrice}</TableCell>
                    <TableCell>{trade.riskPercentage}%</TableCell>
                    <TableCell>${trade.riskAmount}</TableCell>
                    <TableCell>${trade.commission}</TableCell>
                    <TableCell>${trade.pnl}</TableCell>
                    <TableCell>{trade.roi}%</TableCell>
                    <TableCell>{trade.yearlyRoi}%</TableCell>
                    <TableCell>{trade.roiPortfolio}%</TableCell>
                    <TableCell>${trade.breakeven0}</TableCell>
                    <TableCell>${trade.breakeven1}</TableCell>
                    <TableCell>${trade.breakeven2}</TableCell>
                    <TableCell>{trade.delta}</TableCell>
                    <TableCell>{trade.iv}%</TableCell>
                    <TableCell>{trade.ivPercentile}%</TableCell>
                    <TableCell>{trade.notes}</TableCell>
                  </TableRow>
                  {isRowExpanded(trade.id) && trade.entries.map(entry => (
                    <TableRow key={entry.id} className="bg-white">
                      <TableCell></TableCell>
                      <TableCell colSpan={2} className="pl-8">Entry/Exit</TableCell>
                      <TableCell>{entry.quantity}</TableCell>
                      <TableCell>{entry.entryDate}</TableCell>
                      <TableCell colSpan={2}>{entry.exitDate || '-'}</TableCell>
                      <TableCell colSpan={19}>
                        Entry Price: ${entry.priceEntry}
                        {entry.priceExit && ` | Exit Price: $${entry.priceExit}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradeLogTable;