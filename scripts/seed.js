const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { join } = require('path');

// Load .env.local
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Loading data...");
  
  // Dynamic import of the Next.js data file
  const { allProducts } = await import('../lib/data.js');
  
  console.log(`Found ${allProducts.length} products to seed.`);
  
  const { data, error } = await supabase.from('products').insert(allProducts);
  
  if (error) {
    console.error("Error seeding data:", error);
  } else {
    console.log("Successfully seeded database!");
  }
}

seed().catch(console.error);
