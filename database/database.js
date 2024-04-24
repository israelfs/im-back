import mysql from "mysql2";

import dotenv from "dotenv";
import { multiPlanVehicles, biPlanVehicles } from "../utils/chip-plan-ids.js";

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
		"SELECT * FROM gtfs_location_joi._0estudo_position LIMIT 100000;"
	);
	return rows;
}

export async function getMonoOperatorLocations() {
	const vehicleIds = [...multiPlanVehicles, ...biPlanVehicles].map(
		(vehicle) => vehicle.idvehicle
	);
	const [rows] = await pool.execute(
		`SELECT * FROM gtfs_location_joi._0estudo_position WHERE idvehicle NOT IN (?) LIMIT 100000;`,
		[vehicleIds]
	);
	return rows;
}

export async function getBiOperatorLocations() {
	const vehicleIds = biPlanVehicles.map((vehicle) => vehicle.idvehicle);
	const [rows] = await pool.execute(
		`SELECT idposition, idvehicle, time_gps, time_rtc, time_transmit, latitude, longitude, gsm_signal FROM gtfs_location_joi._0estudo_position WHERE idvehicle = ? LIMIT 100000;`,
		vehicleIds
	);
	return rows;
}

export async function getTripleOperatorLocations() {
	const vehicleIds = multiPlanVehicles.map((vehicle) => vehicle.idvehicle);
	const [rows] = await pool.execute(
		`SELECT idposition, idvehicle, time_gps, time_rtc, time_transmit, latitude, longitude, gsm_signal FROM gtfs_location_joi._0estudo_position WHERE idvehicle = ? OR idvehicle = ? LIMIT 100000;`,
		vehicleIds
	);
	return rows;
}
