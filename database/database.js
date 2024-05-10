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
		...(selectedOperators.includes("Multi4G") ? multi4gVehicles : []),
	].map((vehicle) => vehicle.idvehicle);

	const notInludedVehicleIds = [
		...(!selectedOperators.includes("Multi") ? multiPlanVehicles : []),
		...(!selectedOperators.includes("Dual") ? biPlanVehicles : []),
		...(!selectedOperators.includes("Multi4G") ? multi4gVehicles : []),
	].map((vehicle) => vehicle.idvehicle);

	const vehicleIds = selectedOperators.includes("Único")
		? notInludedVehicleIds
		: includedVehicleIds;

	const placeholders = vehicleIds.map(() => "?").join(",");

	const operatorCondition = selectedOperators.includes("Único")
		? "NOT IN"
		: "IN";

	const query = `
			SELECT
							AVG(latitude) AS latitude,
							AVG(longitude) AS longitude,
							AVG(IF(gsm_signal=99,0,gsm_signal)) AS gsm_signal,
							AVG(LEAST(1, transmitness)) AS transmitness,
							AVG(TIMEDIFF(time_transmit,time_rtc)) AS transmit_delay,
							COUNT(*) AS occurences
					FROM gtfs_location_joi._1estudo_position
					JOIN gtfs_location_joi.vehicle2 
					ON gtfs_location_joi._1estudo_position.idvehicle = gtfs_location_joi.vehicle2.idvehicle
					WHERE 
							time_transmit>=time_rtc
							AND gtfs_location_joi._1estudo_position.idvehicle ${operatorCondition} (${placeholders}) 
							AND time_rtc BETWEEN ? AND ? 
							AND (gtfs_location_joi.vehicle2.empresa, gtfs_location_joi.vehicle2.operacao) IN (${companiesPlaceholders})
					GROUP BY FLOOR(latitude*${groupingOrder}),FLOOR(longitude*${groupingOrder})
					ORDER BY transmit_delay ASC`;

	const [rows] = await pool.query(query, [
		...vehicleIds,
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
	grouping
) {
	selectedCompanies =
		selectedCompanies.filter(([, operation]) => operation === "Ideal") || [];

	if (selectedCompanies.length === 0 || !startDate || !endDate || !grouping) {
		return [];
	}

	const groupingOrder =
		grouping === "low" ? "10e3" : grouping === "medium" ? "5*10e2" : "10e2";

	const companiesPlaceholders = selectedCompanies.map(() => "(?, ?)").join(",");

	const query = `
		SELECT
				AVG(latitude) AS latitude,
				AVG(longitude) AS longitude,
				0 AS gsm_signal,
				AVG(LEAST(1, transmitness)) AS transmitness,
				AVG(TIMEDIFF(time_transmit,time_rtc)) AS transmit_delay,
				COUNT(*) AS occurences
			FROM gtfs_location_joi._1estudo_position 
			JOIN gtfs_location_joi.vehicle2 
			ON gtfs_location_joi._1estudo_position.idvehicle = gtfs_location_joi.vehicle2.idvehicle
			WHERE 
				gsm_signal IS NULL
				AND time_transmit>=time_rtc
				AND time_rtc BETWEEN ? AND ? 
				AND (gtfs_location_joi.vehicle2.empresa, gtfs_location_joi.vehicle2.operacao) IN (${companiesPlaceholders})
			GROUP BY FLOOR(latitude*${groupingOrder}),FLOOR(longitude*${groupingOrder})
			ORDER BY transmit_delay ASC`;

	const [rows] = await pool.query(query, [
		startDate,
		endDate,
		...selectedCompanies.flat(),
	]);
	console.log("4G", rows.length);
	return rows;
}

export async function getOfflineChartData(
	selectedCompanies,
	startDate,
	endDate
) {
	if (!startDate || !endDate || selectedCompanies.length === 0) {
		return [];
	}
	const companiesPlaceholders = selectedCompanies.map(() => "(?, ?)").join(",");
	const query = `
		SELECT 
			gtfs_location_joi._1estudo_position.idvehicle, 
			time_rtc, 
			gsm_signal
		FROM gtfs_location_joi._1estudo_position
		JOIN gtfs_location_joi.vehicle2 
		ON gtfs_location_joi._1estudo_position.idvehicle = gtfs_location_joi.vehicle2.idvehicle
		WHERE 
			TIME_TO_SEC(TIMEDIFF(time_transmit,time_rtc)) > 300  
			AND time_rtc BETWEEN ? AND ?
			AND time_transmit>=time_rtc
			AND (gtfs_location_joi.vehicle2.empresa, gtfs_location_joi.vehicle2.operacao) IN (${companiesPlaceholders})
		ORDER BY time_rtc asc;
		`;

	const [rows] = await pool.query(query, [
		startDate,
		endDate,
		...selectedCompanies.flat(),
	]);
	return rows;
}

export async function getCompanies() {
	const [rows] = await pool.execute(
		"SELECT distinct(empresa) FROM gtfs_location_joi.vehicle2;"
	);
	return rows;
}
