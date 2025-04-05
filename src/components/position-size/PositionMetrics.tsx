
  // Return positive for sell actions, negative for buy actions
  const action = position.action?.toLowerCase() || ''
  const isSellAction = action.includes('sell')
  return isSellAction ? Math.abs(maxAnnualROI) : -Math.abs(maxAnnualROI)
