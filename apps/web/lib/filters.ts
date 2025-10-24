export type FilterOption = {
  id: string
  label: string
  count?: number
}

export type FilterSection = {
  id: string
  title: string
  type: "checkbox" | "price" | "toggle"
  options?: FilterOption[]
  min?: number
  max?: number
}

export const filterSections: FilterSection[] = [
  {
    id: "availability",
    title: "Availability",
    type: "toggle",
  },
  {
    id: "category",
    title: "Category",
    type: "checkbox",
    options: [
      { id: "hair-care", label: "Hair Care", count: 4 },
      { id: "styling", label: "Styling", count: 2 },
      { id: "accessories", label: "Accessories", count: 1 },
      { id: "skincare", label: "Skincare", count: 0 },
    ],
  },
  {
    id: "brand",
    title: "Brand",
    type: "checkbox",
    options: [
      { id: "cantu", label: "Cantu", count: 2 },
      { id: "shea-moisture", label: "SheaMoisture", count: 1 },
      { id: "creme-of-nature", label: "Creme of Nature", count: 1 },
      { id: "mielle", label: "Mielle Organics", count: 1 },
      { id: "ors", label: "ORS", count: 1 },
      { id: "sunny-isle", label: "Sunny Isle", count: 1 },
      { id: "generic", label: "Generic", count: 1 },
    ],
  },
  {
    id: "price",
    title: "Price",
    type: "price",
    min: 0,
    max: 25,
  },
]
