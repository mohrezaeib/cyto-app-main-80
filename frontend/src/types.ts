// types.ts

// base type of response 
export interface ApiResponse {
  items: Compound[];
  page: number;
  per_page?: number;
  total_items: number;
  total_pages: number;
}


export interface Compound {
  mol_idx: number;
  base64_png: string;
  fields: {
    "Actin Disruption Activity": string;
    "Box ID": string;
    "Compound": string;
    "IC50": string;
    "Molecular Formula": string;
    "Origin": string;
    "Quantity": string;
    "Reference": string;
    "Reversibilty": string;
    "Smiles": string;
    "Subclass": string;
    "Synonyms": string;
    "Total Molweight": number;
    "Image File":string;
  };

  
}


export interface FilterParams {
  query?: string;
  page?: number;
  per_page?: number;
  min_molweight?: number;
  max_molweight?: number;
  min_ic50?: number;
  max_ic50?: number;
  activity?: string;
  reversibility?: string;
  quantity_type?: string;
  min_quantity?: number;
  max_quantity?: number;
  selected_fields?: string[];
}
