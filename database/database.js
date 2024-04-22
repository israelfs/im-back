import mysql from "mysql2";

import dotenv from "dotenv";

dotenv.config();

const pool = mysql
	.createPool({
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_SCHEMA,
	})
	.promise();

export async function getLocations() {
	const [rows] = await pool.query(
		"SELECT * FROM gtfs_location_joi._0estudo_position LIMIT 10000;"
	);
	return rows;
}
