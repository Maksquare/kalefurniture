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

const initialPackages = [
  {
    id: "pkg-1",
    name: "KAL SIGNATURE",
    collection: "COMPLETE HOME BUNDLE",
    description: "The ultimate curated collection. Transform your entire living space with our premium selection of matching, high-end pieces.",
    mainImage: "/assets/img/hero/beige-chair.jpeg",
    bgColor: "#FAF8F5", // Light beige
    accentColor: "#6B2B31", // Burgundy
    items: [
      {
        name: "LIVING ROOM SOFA",
        specs: { Width: "240 cm", Depth: "95 cm", Height: "75 cm", "Seat": "42 cm", Fabric: "Textured Bouclé", Legs: "Lacquered Wood" },
        image: "/assets/img/hero/beige-chair.jpeg"
      },
      {
        name: "DINING TABLE & SEATS",
        specs: { Width: "200 cm", Depth: "100 cm", Height: "76 cm", Seats: "6 Persons", Material: "Solid Oak", Finish: "Matte" },
        image: "/assets/img/living-room/living-room-13.jpg"
      },
      {
        name: "CENTER TABLE",
        specs: { Diameter: "100 cm", Height: "40 cm", Top: "Travertine Marble", Base: "Brushed Brass" },
        image: "/assets/img/living-room/living-room-4.png"
      },
      {
        name: "LUXURY BED",
        specs: { Size: "King", Width: "180 cm", Length: "200 cm", Material: "Linen Blend", Frame: "Solid Ash" },
        image: "/assets/img/living-room/living-room-2.jpg"
      }
    ],
    price: 200000
  },
  {
    id: "pkg-2",
    name: "MINIMALIST HAVEN",
    collection: "ESSENTIALS COLLECTION",
    description: "Clean lines and understated elegance. Create a tranquil environment where less is truly more.",
    mainImage: "/assets/img/living-room/living-room-12.jpg",
    bgColor: "#F0F0F0", // Light grey
    accentColor: "#2A2A2A", // Dark charcoal
    items: [
      {
        name: "ESSENTIAL BED",
        specs: { Size: "King", Width: "180 cm", Length: "200 cm", Material: "Linen Blend", Frame: "Solid Ash" },
        image: "/assets/img/living-room/living-room-12.jpg"
      },
      {
        name: "NIGHTSTAND PAIR",
        specs: { Width: "50 cm", Depth: "40 cm", Height: "55 cm", Drawers: "Soft-close", Material: "Matte Lacquer" },
        image: "/assets/img/living-room/living-room-14.jpg"
      }
    ],
    price: 150000
  }
];

async function seed() {
  console.log(`Found ${initialPackages.length} packages to seed.`);
  
  const { data, error } = await supabase.from('packages').insert(initialPackages);
  
  if (error) {
    console.error("Error seeding data:", error);
  } else {
    console.log("Successfully seeded packages!");
  }
}

seed().catch(console.error);
