// Where everything sits on the town map (sprites/src/map.txt).
// Each building opens when the learner has shipped a job there; a district
// lights up when its Act is open.

export interface Building {
  id: string;
  sprite: string;
  name: string;
  x: number;
  y: number;
  /** The Act (district) this building belongs to. */
  act: string;
}

export const MAP_W = 400;
export const MAP_H = 240;

export const BUILDINGS: Building[] = [
  { id: "workshop", sprite: "b-workshop", name: "Moss's Workshop", x: 116, y: 148, act: "harbour-front" },
  { id: "bakery", sprite: "b-bakery", name: "Hollis Bakery", x: 146, y: 147, act: "harbour-front" },
  { id: "post-office", sprite: "b-post-office", name: "The Post Office", x: 172, y: 146, act: "harbour-front" },
  { id: "pub", sprite: "b-pub", name: "The Drowned Anchor", x: 208, y: 146, act: "harbour-front" },
  { id: "harbour-office", sprite: "b-harbour-office", name: "Harbour Master's Hut", x: 238, y: 155, act: "harbour-front" },
  { id: "ferry-dock", sprite: "b-ferry", name: "The Ferry", x: 164, y: 194, act: "harbour-front" },
  { id: "lighthouse", sprite: "b-lighthouse", name: "The Lighthouse", x: 352, y: 158, act: "harbour-front" },
  { id: "tailor", sprite: "b-tailor", name: "Okonjo, Tailor", x: 116, y: 95, act: "high-street" },
  { id: "library", sprite: "b-library", name: "The Library", x: 140, y: 93, act: "high-street" },
  { id: "town-hall", sprite: "b-town-hall", name: "The Town Hall", x: 170, y: 91, act: "high-street" },
  { id: "greengrocer", sprite: "b-greengrocer", name: "Sanjay's Greengrocer", x: 214, y: 95, act: "high-street" },
  { id: "bike-shed", sprite: "b-bike-shed", name: "The Bike Hire Shed", x: 238, y: 98, act: "high-street" },
  { id: "high-street", sprite: "b-bike-shed", name: "The High Street", x: -100, y: -100, act: "high-street" },
  { id: "scrapyard", sprite: "b-scrapyard", name: "Brannigan's Scrapyard", x: 28, y: 112, act: "scrapyard" },
  { id: "records-office", sprite: "b-records-office", name: "The Records Office", x: 66, y: 34, act: "records-and-weather" },
  { id: "weather-station", sprite: "b-weather-station", name: "The Weather Station", x: 104, y: 26, act: "records-and-weather" },
  { id: "observatory", sprite: "b-observatory", name: "The Observatory", x: 298, y: 16, act: "observatory-lower" },
  { id: "pier", sprite: "b-pier-arcade", name: "The Pier", x: 318, y: 176, act: "pier" },
  { id: "crab-club", sprite: "b-crab-club", name: "The Pier Arcade", x: 292, y: 99, act: "crab-club" },
  { id: "sea-wall", sprite: "b-crab-club", name: "The Sea Wall", x: -100, y: -100, act: "crab-club" },
];

export const DECOR = [
  { sprite: "b-boat", frame: "moored", x: 222, y: 200 },
  { sprite: "b-boat", frame: "moored", x: 238, y: 218 },
  { sprite: "b-boat", frame: "moored", x: 140, y: 214 },
];

/** Rectangles that darken when a district's Act is still locked. */
export const DISTRICT_AREAS: Record<string, [number, number, number, number][]> = {
  "high-street": [[104, 86, 196, 42]],
  pier: [[308, 168, 40, 28]],
  scrapyard: [[14, 86, 84, 80]],
  "records-and-weather": [[56, 14, 72, 52]],
  "observatory-lower": [[284, 6, 52, 46]],
  "observatory-upper": [],
  "crab-club": [[288, 90, 76, 48]],
  lighthouse: [[346, 152, 26, 12]],
};

export function buildingFor(id: string): Building | undefined {
  return BUILDINGS.find((b) => b.id === id);
}
