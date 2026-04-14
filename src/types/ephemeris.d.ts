/**
 * Type declaration for the `ephemeris` npm package.
 * The package ships no TypeScript types — declared here.
 */
declare module 'ephemeris' {
  interface PlanetObserved {
    name: string;
    apparentLongitudeDms30: string;
    apparentLongitudeDms360: string;
    apparentLongitudeDd: number;
    geocentricDistanceKm: number;
    is_retrograde: boolean;
    raw: {
      position?: {
        apparentLongitude?: number;
        is_retrograde?: boolean;
      };
    };
  }

  interface EphemerisResult {
    date: object;
    observer: object;
    observed: Record<string, PlanetObserved>;
  }

  function getAllPlanets(
    date: Date,
    geodeticalLongitude: number,
    geodeticalLatitude: number,
    height: number
  ): EphemerisResult;

  const ephemeris: { getAllPlanets: typeof getAllPlanets };
  export = ephemeris;
}
