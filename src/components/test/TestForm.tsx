import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type FormData = {
  ticker: string
  expiration: string
  strike_entry: string
  strike_target: string
  strike_protection: string
}

type TestFormProps = {
  formData: FormData
  loading: boolean
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onTestFunction: () => void
  onHardcodedTest: () => void
}

export default function TestForm({ 
  formData, 
  loading, 
  onInputChange, 
  onTestFunction, 
  onHardcodedTest 
}: TestFormProps) {
  return (
    <>
      <div className="grid gap-4 mb-4">
        <div>
          <Label htmlFor="ticker">Ticker</Label>
          <Input
            id="ticker"
            name="ticker"
            value={formData.ticker}
            onChange={onInputChange}
          />
        </div>
        
        <div>
          <Label htmlFor="expiration">Expiration Date</Label>
          <Input
            id="expiration"
            name="expiration"
            type="date"
            value={formData.expiration}
            onChange={onInputChange}
          />
        </div>
        
        <div>
          <Label htmlFor="strike_entry">Entry Strike</Label>
          <Input
            id="strike_entry"
            name="strike_entry"
            type="number"
            value={formData.strike_entry}
            onChange={onInputChange}
          />
        </div>
        
        <div>
          <Label htmlFor="strike_target">Target Strike</Label>
          <Input
            id="strike_target"
            name="strike_target"
            type="number"
            value={formData.strike_target}
            onChange={onInputChange}
          />
        </div>
        
        <div>
          <Label htmlFor="strike_protection">Protection Strike</Label>
          <Input
            id="strike_protection"
            name="strike_protection"
            type="number"
            value={formData.strike_protection}
            onChange={onInputChange}
          />
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <Button 
          onClick={onTestFunction}
          disabled={loading}
        >
          {loading ? 'Fetching...' : 'Fetch Option Data'}
        </Button>

        <Button
          onClick={onHardcodedTest}
          disabled={loading}
          variant="secondary"
        >
          Test Hardcoded URL
        </Button>
      </div>
    </>
  )
}