import { supabase } from './supabaseClient';
import { Sentence } from '../types';
import { SEARCH_LIMIT } from '../constants';

// Function to shuffle array (Fisher-Yates algorithm)
// This ensures true randomness in the presentation of results
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const searchSentences = async (keyword: string): Promise<Sentence[]> => {
  // Trim whitespace
  const cleanKeyword = keyword.trim();

  if (!cleanKeyword) return [];

  // Romaji Check: If input contains Latin letters (a-z, A-Z), return empty immediately.
  const hasRomaji = /[a-zA-Z]/.test(cleanKeyword);
  
  if (hasRomaji) {
    console.warn("Search ignored: Contains Romaji.");
    return [];
  }

  // 1. Fetch more than the limit (2x) to create a pool for randomization
  // We fetch 100 items, shuffle them, and then pick 50. 
  // This adds variety without stressing the DB with a full random sort of 180k rows.
  // NOTE: Using .like() enforces Case Sensitive matching in Postgres/Supabase. 
  // This satisfies the "Exact Match Case" requirement for Japanese search.
  const { data, error } = await supabase
    .from('ex_sentence')
    .select('*')
    .like('jp', `%${cleanKeyword}%`) 
    .limit(SEARCH_LIMIT * 2); 

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(error.message);
  }

  let sentences = data as Sentence[];

  // 2. Filter out bad translations (AI refusals)
  // Sometimes the DB contains "Maaf, saya tidak dapat membantu..."
  sentences = sentences.filter(s => {
    const translation = s.idn ? s.idn.toLowerCase() : '';
    return !translation.includes("maaf, saya tidak dapat membantu");
  });

  // 3. Shuffle the results
  sentences = shuffleArray(sentences);

  // 4. Slice to the actual limit (50)
  return sentences.slice(0, SEARCH_LIMIT);
};