import mysql from "mysql2";

import dotenv from "dotenv";
import {
	multiPlanVehicles,
	biPlanVehicles,
	multi4gVehicles,
} from "../utils/chip-plan-ids.js";

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
	if (
		selectedCompanies.length === 0 ||
		selectedOperators.length === 0 ||
		!startDate ||
		!endDate ||
		!grouping
	) {
		return [];
	}

	const groupingOrder =
		grouping === "low" ? "10e3" : grouping === "medium" ? "5*10e2" : "10e2";

	const companiesPlaceholders = selectedCompanies.map(() => "(?, ?)").join(",");

	const includedVehicleIds = [
		...(selectedOperators.includes("Multi") ? multiPlanVehicles : []),
		...(selectedOperators.includes("Dual") ? biPlanVehicles : []),
	].map((vehicle) => vehicle.idvehicle);

	const notInludedVehicleIds = [
		...(!selectedOperators.includes("Multi") ? multiPlanVehicles : []),
		...(!selectedOperators.includes("Dual") ? biPlanVehicles : []),
	].map((vehicle) => vehicle.idvehicle);

	if (selectedOperators.includes("Único")) {
		const placeholders = notInludedVehicleIds.map(() => "?").join(",");

		const query = `
			SELECT
					AVG(latitude) AS latitude,
					AVG(longitude) AS longitude,
					AVG(gsm_signal) AS gsm_signal,
					AVG(TIMEDIFF(time_transmit,time_rtc)) AS transmit_delay,
					COUNT(*) AS occurences
				FROM gtfs_location_joi._1estudo_position
				JOIN gtfs_location_joi.vehicle2 ON gtfs_location_joi._1estudo_position.idvehicle = gtfs_location_joi.vehicle2.idvehicle
				WHERE 
					gtfs_location_joi._1estudo_position.idvehicle NOT IN (${placeholders}) 
					AND time_rtc BETWEEN ? AND ? 
					AND (gtfs_location_joi.vehicle2.empresa, gtfs_location_joi.vehicle2.operacao) IN (${companiesPlaceholders})
				GROUP BY FLOOR(latitude*${groupingOrder}),FLOOR(longitude*${groupingOrder})`;

		const [rows] = await pool.query(query, [
			...notInludedVehicleIds,
			startDate,
			endDate,
			...selectedCompanies.flat(),
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
			FROM gtfs_location_joi._1estudo_position
			JOIN gtfs_location_joi.vehicle2 ON gtfs_location_joi._1estudo_position.idvehicle = gtfs_location_joi.vehicle2.idvehicle
			WHERE 
				gtfs_location_joi._1estudo_position.idvehicle IN (${placeholders}) 
				AND time_rtc BETWEEN ? AND ? 
				AND (gtfs_location_joi.vehicle2.empresa, gtfs_location_joi.vehicle2.operacao) IN (${companiesPlaceholders})
			GROUP BY FLOOR(latitude*${groupingOrder}),FLOOR(longitude*${groupingOrder})`;

	const [rows] = await pool.query(query, [
		...includedVehicleIds,
		startDate,
		endDate,
		...selectedCompanies.flat(),
	]);
	console.log(rows.length);
	return rows;
}

export async function get4gLocations(
	selectedCompanies,
	startDate,
	endDate,
	grouping,
	isMulti4G
) {
	if (selectedCompanies.length === 0 || !startDate || !endDate || !grouping) {
		return [];
	}

	const groupingOrder =
		grouping === "low" ? "10e3" : grouping === "medium" ? "5*10e2" : "10e2";

	if (isMulti4G) {
		const multi4GIds = multi4gVehicles.map((vehicle) => vehicle.idvehicle);
		const multi4gPlaceholders = multi4gVehicles.map(() => "?").join(",");
		const query = `
		SELECT
				AVG(latitude) AS latitude,
				AVG(longitude) AS longitude,
				AVG(IF(gsm_signal=99,0,gsm_signal)) AS gsm_signal,
				AVG(TIMEDIFF(time_transmit,time_rtc)) AS transmit_delay,
				COUNT(*) AS occurences
			FROM gtfs_location_joi._1estudo_position 
			WHERE 
				gtfs_location_joi._1estudo_position.idvehicle IN (${multi4gPlaceholders})
				AND time_rtc BETWEEN ? AND ? 
			GROUP BY FLOOR(latitude*${groupingOrder}),FLOOR(longitude*${groupingOrder})`;

		const [rows] = await pool.query(query, [...multi4GIds, startDate, endDate]);
		console.log("Multi4G", rows.length);
		return rows;
	}

	const companiesPlaceholders = selectedCompanies.map(() => "(?, ?)").join(",");

	const query = `
		SELECT
				AVG(latitude) AS latitude,
				AVG(longitude) AS longitude,
				0 AS gsm_signal,
				AVG(TIMEDIFF(time_transmit,time_rtc)) AS transmit_delay,
				COUNT(*) AS occurences
			FROM gtfs_location_joi._1estudo_position 
			JOIN gtfs_location_joi.vehicle2 ON gtfs_location_joi._1estudo_position.idvehicle = gtfs_location_joi.vehicle2.idvehicle
			WHERE 
				gsm_signal IS NULL
				AND time_rtc BETWEEN ? AND ? 
				AND (gtfs_location_joi.vehicle2.empresa, gtfs_location_joi.vehicle2.operacao) IN (${companiesPlaceholders})
			GROUP BY FLOOR(latitude*${groupingOrder}),FLOOR(longitude*${groupingOrder})`;

	const [rows] = await pool.query(query, [
		startDate,
		endDate,
		...selectedCompanies.flat(),
	]);
	console.log("4G", rows.length);
	return rows;
}

export async function getCompanies() {
	const [rows] = await pool.execute(
		"SELECT distinct(empresa) FROM gtfs_location_joi.vehicle2;"
	);
	return rows;
}
