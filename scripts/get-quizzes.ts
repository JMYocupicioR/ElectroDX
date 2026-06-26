import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('published_quizzes').select('topic_id');
  if (error) {
    console.error("Error fetching quizzes:", error);
    process.exit(1);
  }
  
  if (data && data.length > 0) {
    console.log("Topics with quizzes:");
    for (const row of data) {
      console.log("- " + row.topic_id);
    }
  } else {
    console.log("No quizzes found in the database.");
  }
}

main();
