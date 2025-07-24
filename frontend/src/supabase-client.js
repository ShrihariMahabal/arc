import {createClient} from '@supabase/supabase-js';

export const supabase = createClient('https://iiletzltidysmwgdbtob.supabase.co', import.meta.env.VITE_API_KEY);
