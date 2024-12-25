export const getRowBackground = (isSubRow: boolean, tradeStatus: "open" | "closed", pnl?: number | null) => {
  if (isSubRow) {
    return tradeStatus === "closed" ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-50"
  }
  
  if (tradeStatus === "open") return "bg-yellow-50 hover:bg-yellow-100"
  
  if (pnl === undefined || pnl === null) return "bg-yellow-50 hover:bg-yellow-100"
  if (pnl > 0) return "bg-green-50 hover:bg-green-100"
  if (pnl < 0) return "bg-red-50 hover:bg-red-100"
  return "bg-yellow-50 hover:bg-yellow-100"
}

export const getStickyBackground = (isSubRow: boolean, tradeStatus: "open" | "closed", pnl?: number | null) => {
  if (isSubRow) {
    return tradeStatus === "closed" ? "bg-gray-50 group-hover:bg-gray-100" : "bg-white group-hover:bg-gray-50"
  }
  
  if (tradeStatus === "open") return "bg-yellow-50 group-hover:bg-yellow-100"
  
  if (pnl === undefined || pnl === null) return "bg-yellow-50 group-hover:bg-yellow-100"
  if (pnl > 0) return "bg-green-50 group-hover:bg-green-100"
  if (pnl < 0) return "bg-red-50 group-hover:bg-red-100"
  return "bg-yellow-50 group-hover:bg-yellow-100"
}