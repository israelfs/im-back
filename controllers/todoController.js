import {
	getLocations,
	getCompanies,
	get4gLocations,
} from "../database/database.js";

export async function getAllLocations(req, res) {
	const { companies, operators, startDate, endDate, grouping } = req.query;

	const companiesArray = JSON.parse(companies);
	const operatorsArray = Array.isArray(operators)
		? operators
		: operators
		? [operators]
		: [];

	let locations;
	if (
		operatorsArray.includes("Celular") ||
		operatorsArray.includes("Multi4G")
	) {
		locations = await get4gLocations(
			companiesArray,
			startDate,
			endDate,
			grouping,
			operatorsArray.includes("Multi4G")
		);
	} else {
		locations = await getLocations(
			companiesArray,
			operatorsArray,
			startDate,
			endDate,
			grouping
		);
	}

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
	res.send({ locations, delay });
}

export async function getAllCompanies(req, res) {
	const companies = await getCompanies();
	res.send(companies);
}
