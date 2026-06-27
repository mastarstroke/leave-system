import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import pool from "../src/config/database.js";

const seedsDir = path.join(process.cwd(), "src", "database", "seed");

async function seed() {

    const files = fs
        .readdirSync(seedsDir)
        .filter(file => file.endsWith(".sql"))
        .sort();

    for (const file of files) {

        console.log(`Running ${file}...`);

        const sql = fs.readFileSync(
            path.join(seedsDir, file),
            "utf8"
        );

        await pool.query(sql);

        console.log(`${file} completed`);
    }

    console.log("Database seeded successfully.");

    await pool.end();
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});