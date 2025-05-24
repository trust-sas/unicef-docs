import React from 'react'
import { FilterCheckbox } from './filter-checkbox'
import { FilterRadio } from './filter-radio'
// import { FilterRange } from './filter-range'
// import { FilterProps } from '@/types/filter'

type FilterType = 'checkbox' | 'radio' | 'range'

type FilterOption = {
  value: string
  label: string
}

type FilterProps = {
  type: FilterType
  name?: string
  nameMin?: string
  nameMax?: string
  label?: string
  options?: FilterOption[] // Pour checkbox et radio
  min?: number
  max?: number
}

export const Filter: React.FC<FilterProps> = (props) => {
  if (props.type === 'checkbox' && props.name && props.options) {
    return <FilterCheckbox name={props.name} label={props.label} options={props.options} />
  }

  if (props.type === 'radio' && props.name && props.options) {
    return <FilterRadio name={props.name} label={props.label} options={props.options} />
  }

  // if (props.type === 'range' && props.nameMin && props.nameMax) {
  //   return (
  //     <FilterRange
  //       nameMin={props.nameMin}
  //       nameMax={props.nameMax}
  //       label={props.label}
  //       min={props.min}
  //       max={props.max}
  //     />
  //   )
  // }

  return null
}
