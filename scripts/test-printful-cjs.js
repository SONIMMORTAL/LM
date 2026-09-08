const dotenv = require("dotenv");
const path = require("path");

// Load .env.local
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const PRINTFUL_API_URL = "https://api.printful.com";
const token = process.env.PRINTFUL_ACCESS_TOKEN || "nVDwYb2x2FG0VJUzYlCtdN1GRtwfVULA2gPNoeJM";
const storeId = process.env.PRINTFUL_STORE_ID || "14580155";

async function main() {
    try {
        console.log("Fetching products list...");
        const response = await fetch(`${PRINTFUL_API_URL}/sync/products?limit=100`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-PF-Store-Id": storeId,
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            throw new Error(`Printful error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Found ${data.result.length} products:`);
        for (const p of data.result) {
            console.log(`- ID: ${p.id}, Name: ${p.name}, Variants: ${p.variants}`);
        }

        if (data.result.length > 0) {
            const firstId = data.result[0].id;
            console.log(`\nFetching details for product ID ${firstId}...`);
            const detailsResponse = await fetch(`${PRINTFUL_API_URL}/sync/products/${firstId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "X-PF-Store-Id": storeId,
                    "Content-Type": "application/json",
                }
            });
            const detailsData = await detailsResponse.json();
            console.log("Sync product metadata:", detailsData.result.sync_product);
            console.log("First variant:", detailsData.result.sync_variants[0]);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
