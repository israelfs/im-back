import {
	getLocations,
	getMonoOperatorLocations,
	getBiOperatorLocations,
	getTripleOperatorLocations,
} from "../database/database.js";

export async function getAllLocations(req, res) {
	const locations = await getLocations();
	res.send(locations);
}

export async function getAllMonoOperatorLocations(req, res) {
	const locations = await getMonoOperatorLocations();
	res.send(locations);
}

export async function getAllBiOperatorLocations(req, res) {
	const locations = await getBiOperatorLocations();
	res.send(locations);
}

export async function getAllTripleOperatorLocations(req, res) {
	const locations = await getTripleOperatorLocations();
	console.log(locations);
	res.send(locations);
}
