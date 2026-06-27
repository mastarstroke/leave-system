import fs from "fs";
import path from "path";
import pool from "../src/config/database.js";

const migrationsDir = path.join(process.cwd(), "src", "database", "migrations");


async function migrate() {
    const files = fs
        .readdirSync(migrationsDir)
        .filter(file => file.endsWith(".sql"))
        .sort();

    for (const file of files) {
        console.log(`Running ${file}...`);

        const sql = fs.readFileSync(
            path.join(migrationsDir, file),
            "utf8"
        );

        await pool.query(sql);

        console.log(`✅ ${file} completed`);
    }

    console.log("🎉 All migrations completed.");

    await pool.end();
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});