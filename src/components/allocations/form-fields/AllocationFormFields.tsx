import { Control } from "react-hook-form"
import { TextField } from "./TextField"
import { SelectField } from "./SelectField"
import { AllocationTradeFormValues } from "@/types/forms"

const vehicleOptions = [
  { label: "Stock", value: "Stock" },
  { label: "Note", value: "Note" },
  { label: "Fund", value: "Fund" },
  { label: "Bond", value: "Bond" },
  { label: "Options", value: "Options" },
]

const riskProfileOptions = [
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
]

interface AllocationFormFieldsProps {
  control: Control<AllocationTradeFormValues>
}

export function AllocationFormFields({ control }: AllocationFormFieldsProps) {
  return (
    <div className="space-y-4">
      <TextField 
        control={control} 
        name="bucket" 
        label="Bucket" 
      />
      
      <SelectField
        control={control}
        name="vehicle"
        label="Vehicle"
        options={vehicleOptions}
      />
      
      <TextField 
        control={control} 
        name="value_actual" 
        label="Value Actual"
        type="number"
      />
      
      <TextField 
        control={control} 
        name="weight_target" 
        label="Weight Target"
        type="number"
      />
      
      <SelectField
        control={control}
        name="risk_profile"
        label="Risk Profile"
        options={riskProfileOptions}
      />
      
      <TextField 
        control={control} 
        name="dividend_%" 
        label="Dividend %"
        type="number"
      />
    </div>
  )
}