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

pool.on("acquire", function (connection) {
	connection.stream.setKeepAlive(true, 60000);
});

export async function getLocations() {
	const [rows] = await pool.query(
		`SELECT 
				AVG(latitude) AS latitude,
					AVG(longitude) AS longitude,
					AVG(gsm_signal) AS gsm_signal,
					AVG(TIMEDIFF(time_transmit,time_rtc)) AS transmit_delay,
					COUNT(*) AS occurences
			FROM gtfs_location_joi._0estudo_position
			WHERE idposition<2893852320
			GROUP BY FLOOR(latitude*10e3),FLOOR(longitude*10e3)`
	);
	return rows;
}

export async function getMonoOperatorLocations() {
	const vehicleIds = [...multiPlanVehicles, ...biPlanVehicles].map(
		(vehicle) => vehicle.idvehicle
	);
	const [rows] = await pool.execute(
		`SELECT 
							AVG(latitude) AS latitude,
							AVG(longitude) AS longitude,
							AVG(gsm_signal) AS gsm_signal,
							AVG(TIMEDIFF(time_transmit,time_rtc)) AS transmit_delay,
							COUNT(*) AS occurences
					FROM gtfs_location_joi._0estudo_position
					WHERE idposition<2893852320 AND idvehicle NOT IN (?)
					GROUP BY FLOOR(latitude*10e3),FLOOR(longitude*10e3)`,
		[vehicleIds]
	);
	return rows;
}

export async function getBiOperatorLocations() {
	const vehicleIds = biPlanVehicles.map((vehicle) => vehicle.idvehicle);
	const placeholders = vehicleIds.map(() => "?").join(",");
	const [rows] = await pool.execute(
		`SELECT 
					AVG(latitude) AS latitude,
					AVG(longitude) AS longitude,
					AVG(gsm_signal) AS gsm_signal,
					AVG(TIMEDIFF(time_transmit,time_rtc)) AS transmit_delay,
					COUNT(*) AS occurences
			FROM gtfs_location_joi._0estudo_position
			WHERE idposition<2893852320 AND idvehicle IN (${placeholders})
			GROUP BY FLOOR(latitude*10e3),FLOOR(longitude*10e3)`,
		vehicleIds
	);
	return rows;
}

export async function getTripleOperatorLocations() {
	const vehicleIds = multiPlanVehicles.map((vehicle) => vehicle.idvehicle);
	const placeholders = vehicleIds.map(() => "?").join(",");
	const [rows] = await pool.execute(
		`SELECT 
					AVG(latitude) AS latitude,
					AVG(longitude) AS longitude,
					AVG(gsm_signal) AS gsm_signal,
					AVG(TIMEDIFF(time_transmit,time_rtc)) AS transmit_delay,
					COUNT(*) AS occurences
			FROM gtfs_location_joi._0estudo_position
			WHERE idposition<2893852320 AND idvehicle IN (${placeholders})
			GROUP BY FLOOR(latitude*10e3),FLOOR(longitude*10e3)`,
		vehicleIds
	);
	return rows;
}
