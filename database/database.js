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

export async function getLocations(
	selectedCompanies,
	selectedOperators,
	startDate,
	endDate,
	grouping
) {
	const groupingOrder =
		grouping === "low" ? "10e3" : grouping === "medium" ? "5*10e2" : "10e2";

	const includedVehicleIds = [
		...(selectedOperators.includes("Multi") ? multiPlanVehicles : []),
		...(selectedOperators.includes("Dual") ? biPlanVehicles : []),
	].map((vehicle) => vehicle.idvehicle);

	const notInludedVehicleIds = [
		...(!selectedOperators.includes("Multi") ? multiPlanVehicles : []),
		...(!selectedOperators.includes("Dual") ? biPlanVehicles : []),
	].map((vehicle) => vehicle.idvehicle);

	const companiesPlaceholders = selectedCompanies.map(() => "?").join(",");

	if (selectedOperators.includes("Único")) {
		const placeholders = notInludedVehicleIds.map(() => "?").join(",");

		const query = `
			SELECT
					AVG(latitude) AS latitude,
					AVG(longitude) AS longitude,
					AVG(gsm_signal) AS gsm_signal,
					AVG(TIMEDIFF(time_transmit,time_rtc)) AS transmit_delay,
					COUNT(*) AS occurences
				FROM gtfs_location_joi._0estudo_position
				JOIN gtfs_location_joi.vehicle2 ON gtfs_location_joi._0estudo_position.idvehicle = gtfs_location_joi.vehicle2.idvehicle
				WHERE time_rtc BETWEEN ? AND ? AND gtfs_location_joi._0estudo_position.idvehicle NOT IN (${placeholders})
					AND gtfs_location_joi.vehicle2.empresa IN (${companiesPlaceholders})
				GROUP BY FLOOR(latitude*${groupingOrder}),FLOOR(longitude*${groupingOrder})`;

		const [rows] = await pool.query(query, [
			startDate,
			endDate,
			...notInludedVehicleIds,
			...selectedCompanies,
		]);
		console.log(rows.length);
		return rows;
	}
	const placeholders = includedVehicleIds.map(() => "?").join(",");

	const query = `
		SELECT
				AVG(latitude) AS latitude,
				AVG(longitude) AS longitude,
				AVG(gsm_signal) AS gsm_signal,
				AVG(TIMEDIFF(time_transmit,time_rtc)) AS transmit_delay,
				COUNT(*) AS occurences
			FROM gtfs_location_joi._0estudo_position
			JOIN gtfs_location_joi.vehicle2 ON gtfs_location_joi._0estudo_position.idvehicle = gtfs_location_joi.vehicle2.idvehicle
			WHERE time_rtc BETWEEN ? AND ? AND gtfs_location_joi._0estudo_position.idvehicle IN (${placeholders})
				AND gtfs_location_joi.vehicle2.empresa IN (${companiesPlaceholders})
			GROUP BY FLOOR(latitude*${groupingOrder}),FLOOR(longitude*${groupingOrder})`;

	const [rows] = await pool.query(query, [
		startDate,
		endDate,
		...includedVehicleIds,
		...selectedCompanies,
	]);
	console.log(rows.length);
	return rows;
}

export async function getCompanies() {
	const [rows] = await pool.execute(
		"SELECT distinct(empresa) FROM gtfs_location_joi.vehicle2;"
	);
	return rows;
}
