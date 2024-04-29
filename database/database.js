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

export async function getLocations(selectedCompany) {
	const query = `
			SELECT 
					AVG(latitude) AS latitude,
					AVG(longitude) AS longitude,
					AVG(gsm_signal) AS gsm_signal,
					AVG(TIMEDIFF(time_transmit,time_rtc)) AS transmit_delay,
					COUNT(*) AS occurences
			FROM gtfs_location_joi._0estudo_position
			JOIN gtfs_location_joi.vehicle2 ON gtfs_location_joi._0estudo_position.idvehicle = gtfs_location_joi.vehicle2.idvehicle
			WHERE idposition<2893852320
			AND gtfs_location_joi.vehicle2.empresa ${
				selectedCompany === "Todas" ? "!=" : "="
			} ?
			GROUP BY FLOOR(latitude*10e3),FLOOR(longitude*10e3)
	`;
	const [rows] = await pool.query(query, [selectedCompany]);
	console.log("len", rows.length);
	return rows;
}

export async function getMonoOperatorLocations(selectedCompany) {
	const vehicleIds = [...multiPlanVehicles, ...biPlanVehicles].map(
		(vehicle) => vehicle.idvehicle
	);
	const placeholders = vehicleIds.map(() => "?").join(",");
	const query = `
					SELECT 
									AVG(latitude) AS latitude,
									AVG(longitude) AS longitude,
									AVG(gsm_signal) AS gsm_signal,
									AVG(TIMEDIFF(time_transmit,time_rtc)) AS transmit_delay,
									COUNT(*) AS occurences
					FROM gtfs_location_joi._0estudo_position
					JOIN gtfs_location_joi.vehicle2 ON gtfs_location_joi._0estudo_position.idvehicle = gtfs_location_joi.vehicle2.idvehicle
					WHERE idposition<2893852320 AND gtfs_location_joi._0estudo_position.idvehicle NOT IN (${placeholders})
					AND gtfs_location_joi.vehicle2.empresa ${
						selectedCompany === "Todas" ? "!=" : "="
					} ?
					GROUP BY FLOOR(latitude*10e3),FLOOR(longitude*10e3)
	`;
	const [rows] = await pool.query(query, [...vehicleIds, selectedCompany]);
	console.log("len", rows.length);
	return rows;
}

export async function getBiOperatorLocations(selectedCompany) {
	const vehicleIds = biPlanVehicles.map((vehicle) => vehicle.idvehicle);
	const placeholders = vehicleIds.map(() => "?").join(",");

	const query = `
			SELECT 
					AVG(latitude) AS latitude,
					AVG(longitude) AS longitude,
					AVG(gsm_signal) AS gsm_signal,
					AVG(TIMEDIFF(time_transmit,time_rtc)) AS transmit_delay,
					COUNT(*) AS occurences
			FROM gtfs_location_joi._0estudo_position
			JOIN gtfs_location_joi.vehicle2 ON gtfs_location_joi._0estudo_position.idvehicle = gtfs_location_joi.vehicle2.idvehicle
			WHERE idposition<2949852320 AND gtfs_location_joi._0estudo_position.idvehicle IN (${placeholders})
			AND gtfs_location_joi.vehicle2.empresa ${
				selectedCompany === "Todas" ? "!=" : "="
			} ?
			GROUP BY FLOOR(latitude*10e3),FLOOR(longitude*10e3)
	`;

	const [rows] = await pool.query(query, [...vehicleIds, selectedCompany]);
	console.log("len", rows.length);
	return rows;
}

export async function getTripleOperatorLocations(selectedCompany) {
	const vehicleIds = multiPlanVehicles.map((vehicle) => vehicle.idvehicle);
	const placeholders = vehicleIds.map(() => "?").join(",");

	const query = `
			SELECT 
					AVG(latitude) AS latitude,
					AVG(longitude) AS longitude,
					AVG(gsm_signal) AS gsm_signal,
					AVG(TIMEDIFF(time_transmit,time_rtc)) AS transmit_delay,
					COUNT(*) AS occurences
			FROM gtfs_location_joi._0estudo_position
			JOIN gtfs_location_joi.vehicle2 ON gtfs_location_joi._0estudo_position.idvehicle = gtfs_location_joi.vehicle2.idvehicle
			WHERE idposition<2949852320 AND gtfs_location_joi._0estudo_position.idvehicle IN (${placeholders})
			AND gtfs_location_joi.vehicle2.empresa ${
				selectedCompany === "Todas" ? "!=" : "="
			} ?
			GROUP BY FLOOR(latitude*10e3),FLOOR(longitude*10e3)
	`;

	const [rows] = await pool.query(query, [...vehicleIds, selectedCompany]);
	console.log("len", rows.length);
	return rows;
}

export async function getCompanies() {
	const [rows] = await pool.execute(
		"SELECT idcompany, name, cnpj FROM gtfs_location_joi.company;"
	);
	return rows;
}
