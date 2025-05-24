import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useFacetedSearch } from '@/hooks/use-faceted-search'

type Props = {
  name: string
  label?: string
  options: { label: string; value: string }[]
}

export const FilterCheckbox = ({ name, label, options }: Props) => {
  const { selectedValues, toggleValue } = useFacetedSearch(name)

  return (
    <div className="mb-4">
      {label && <h3 className="font-medium mb-2">{label}</h3>}
      <div className="space-y-1">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${name}-${option.value}`}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={() => toggleValue(option.value)}
            />
            <Label htmlFor={`${name}-${option.value}`} className="text-sm text-gray-700">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
