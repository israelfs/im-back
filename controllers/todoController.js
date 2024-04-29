import {
	getLocations,
	getMonoOperatorLocations,
	getBiOperatorLocations,
	getTripleOperatorLocations,
	getCompanies,
} from "../database/database.js";

export async function getAllLocations(req, res) {
	const selectedCompany = req.query.selectedCompany;
	const locations = await getLocations(selectedCompany);
	res.send(locations);
}

export async function getAllMonoOperatorLocations(req, res) {
	const selectedCompany = req.query.selectedCompany;
	const locations = await getMonoOperatorLocations(selectedCompany);
	res.send(locations);
}

export async function getAllBiOperatorLocations(req, res) {
	const selectedCompany = req.query.selectedCompany;
	const locations = await getBiOperatorLocations(selectedCompany);
	res.send(locations);
}

export async function getAllTripleOperatorLocations(req, res) {
	const selectedCompany = req.query.selectedCompany;
	const locations = await getTripleOperatorLocations(selectedCompany);
	res.send(locations);
}

export async function getAllCompanies(req, res) {
	const companies = await getCompanies();
	res.send(companies);
}
