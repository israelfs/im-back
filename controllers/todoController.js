import { getLocations } from "../database/database.js";

export async function getAllLocations(req, res) {
	const locations = await getLocations();
	res.send(locations);
}
