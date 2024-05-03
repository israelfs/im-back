import { getLocations, getCompanies } from "../database/database.js";

export async function getAllLocations(req, res) {
	const { companies, operators, startDate, endDate, grouping } = req.query;

	const companiesArray = JSON.parse(companies);
	const operatorsArray = Array.isArray(operators)
		? operators
		: operators
		? [operators]
		: [];

	const locations = await getLocations(
		companiesArray,
		operatorsArray,
		startDate,
		endDate,
		grouping
	);
	res.send(locations);
}

export async function getAllCompanies(req, res) {
	const companies = await getCompanies();
	res.send(companies);
}
