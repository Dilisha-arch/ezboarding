
const { getUniversities } = require('./src/lib/data/universities');
require('dotenv').config();

async function test() {
  console.log("Calling getUniversities...");
  try {
    const unis = await getUniversities();
    console.log(`Found ${unis.length} universities.`);
    if (unis.length > 0) {
      console.log("First university:", JSON.stringify(unis[0], null, 2));
    }
  } catch (error) {
    console.error("Error calling getUniversities:", error);
  }
}

test();
