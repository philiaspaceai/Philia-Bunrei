
export interface Sentence {
  id: number;
  jp: string;
  idn: string;
}

export interface SearchState {
  query: string;
  results: Sentence[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}