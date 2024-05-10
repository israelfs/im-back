import {
	getLocations,
	getCompanies,
	get4gLocations,
	getOfflineChartData,
} from "../database/database.js";
import {
	multiPlanVehicles,
	biPlanVehicles,
	multi4gVehicles,
} from "../utils/chip-plan-ids.js";

export async function getAllLocations(req, res) {
	const { companies, operators, startDate, endDate, grouping } = req.query;

	const companiesArray = JSON.parse(companies);
	const operatorsArray = Array.isArray(operators)
		? operators
		: operators
		? [operators]
		: [];

	const locations = operatorsArray.includes("Celular")
		? await get4gLocations(companiesArray, startDate, endDate, grouping)
		: await getLocations(
				companiesArray,
				operatorsArray,
				startDate,
				endDate,
				grouping
		  );

	// DELAY CHART DATA
	const totalOccurrences = locations.reduce(
		(sum, location) => sum + location.occurences,
		0
	);

	const timeThresholds = [0, 20, 60, 300, 900, 1800, 3600, 7200, 21600, 86400];
	let accumulativeSum = 0;
	let arrayIndex = 0;
	let delay = [];

	for (let i = 0; i < timeThresholds.length; i++) {
		while (
			arrayIndex < locations.length &&
			locations[arrayIndex].transmit_delay <= timeThresholds[i]
		) {
			accumulativeSum += locations[arrayIndex++].occurences;
		}
		delay.push({
			time: timeThresholds[i],
			value: accumulativeSum / totalOccurrences,
		});
	}

	// OFFLINE CHART DATA
	const offlineData = await getOfflineChartData(
		companiesArray,
		startDate,
		endDate
	);

	const seriesNames = ["Mono", "Multi", "Dual", "Multi4G", "Celular"];
	const seriesData = seriesNames.map(() => []);

	const finalDate = new Date(endDate);

	let currentIdx = 0;

	for (
		const currentDate = new Date(startDate);
		currentDate <= finalDate;
		currentDate.setMinutes(currentDate.getMinutes() + 5)
	) {
		const idsMono = new Set();
		const idsMulti = new Set();
		const idsDual = new Set();
		const idsMulti4G = new Set();
		const idsCelular = new Set();

		while (
			currentIdx < offlineData.length &&
			new Date(offlineData[currentIdx].time_rtc) <= currentDate
		) {
			const item = offlineData[currentIdx++];

			if (item.gsm_signal === null) {
				idsCelular.add(item.idvehicle);
			} else if (
				multiPlanVehicles.some((v) => v.idvehicle === item.idvehicle.toString())
			) {
				idsMulti.add(item.idvehicle);
			} else if (
				biPlanVehicles.some((v) => v.idvehicle === item.idvehicle.toString())
			) {
				idsDual.add(item.idvehicle);
			} else if (
				multi4gVehicles.some((v) => v.idvehicle === item.idvehicle.toString())
			) {
				idsMulti4G.add(item.idvehicle);
			} else {
				idsMono.add(item.idvehicle);
			}
		}

		seriesNames.forEach((_, i) => {
			seriesData[i].push({
				name: new Date(currentDate),
				value:
					i === 0
						? idsMono.size
						: i === 1
						? idsMulti.size
						: i === 2
						? idsDual.size
						: i === 3
						? idsMulti4G.size
						: idsCelular.size,
			});
		});
	}

	const offline = seriesNames.map((name, i) => ({
		name,
		series: seriesData[i],
	}));

	res.send({ locations, delay, offline });
}

export async function getAllCompanies(req, res) {
	const companies = await getCompanies();
	res.send(companies);
}
