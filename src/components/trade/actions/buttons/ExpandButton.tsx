import { ArrowDown, ArrowUp } from "lucide-react"

interface ExpandButtonProps {
  isExpanded: boolean
  onToggle: () => void
}

export const ExpandButton = ({ isExpanded, onToggle }: ExpandButtonProps) => {
  return (
    <div 
      onClick={onToggle}
      className="cursor-pointer"
    >
      {isExpanded ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowDown className="h-4 w-4" />
      )}
    </div>
  )
}