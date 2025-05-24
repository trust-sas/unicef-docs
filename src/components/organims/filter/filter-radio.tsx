import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useFacetedSearch } from '@/hooks/use-faceted-search'

type Props = {
  name: string
  label?: string
  options: { label: string; value: string }[]
}

export const FilterRadio = ({ name, label, options }: Props) => {
  const { selectedValues, setValue } = useFacetedSearch(name)

  return (
    <div className="mb-4">
      {label && <h3 className="font-medium mb-2">{label}</h3>}
      <RadioGroup
        value={selectedValues[0] || ''}
        onValueChange={(value) => setValue(value)}
        className="space-y-1"
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
            <Label htmlFor={`${name}-${option.value}`}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
