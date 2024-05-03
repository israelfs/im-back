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
	if (operatorsArray.includes("4G")) {
		locations = await get4gLocations(
			companiesArray,
			startDate,
			endDate,
			grouping
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
	res.send(locations);
}

export async function getAllCompanies(req, res) {
	const companies = await getCompanies();
	res.send(companies);
}
