/**
 * Type declaration for the `swisseph` npm package.
 * The package ships no TypeScript types — declared here.
 * Only the subset used by this application is typed.
 */
declare module 'swisseph' {

  // ── Calendar constant ──────────────────────────────────────────────────────
  const SE_GREG_CAL: number;   // Gregorian calendar flag

  // ── Sidereal mode ─────────────────────────────────────────────────────────
  const SE_SIDM_LAHIRI: number;  // Lahiri (Chitrapaksha) ayanamsa

  // ── Planet IDs ────────────────────────────────────────────────────────────
  const SE_SUN:      number;  // 0
  const SE_MOON:     number;  // 1
  const SE_MERCURY:  number;  // 2
  const SE_VENUS:    number;  // 3
  const SE_MARS:     number;  // 4
  const SE_JUPITER:  number;  // 5
  const SE_SATURN:   number;  // 6
  const SE_TRUE_NODE: number; // 11 — True lunar node (Rahu)

  // ── Calculation flags ─────────────────────────────────────────────────────
  const SEFLG_SWIEPH:   number;  // 2  — use Swiss Ephemeris files
  const SEFLG_SIDEREAL: number;  // 64 — sidereal coordinates
  const SEFLG_SPEED:    number;  // 256 — compute speed

  // ── Core functions ────────────────────────────────────────────────────────

  /** Returns Julian Day Number for a given date/time in UT. */
  function swe_julday(
    year: number,
    month: number,
    day: number,
    hour: number,   // decimal UT hours (e.g. 9.5 = 09:30 UT)
    gregflag: number
  ): number;

  /** Sets the sidereal mode (must be called before swe_calc_ut). */
  function swe_set_sid_mode(
    sid_mode: number,
    t0: number,
    ayan_t0: number
  ): void;

  /** Returns the ayanamsa value for a Julian Day in UT. */
  function swe_get_ayanamsa_ut(tjd_ut: number): number;

  interface CalcResult {
    longitude: number;          // ecliptic longitude (degrees)
    latitude: number;           // ecliptic latitude (degrees)
    distance: number;           // distance (AU)
    longitudeSpeed: number;     // speed in longitude (deg/day; negative = retrograde)
    latitudeSpeed: number;
    distanceSpeed: number;
    error?: string;
  }

  /** Calculates planet position for a Julian Day in UT. */
  function swe_calc_ut(
    tjd_ut: number,
    ipl: number,
    iflag: number
  ): CalcResult;

  interface HousesResult {
    house: number[];     // [unused, cusp1, cusp2, ..., cusp12] (tropical degrees)
    ascendant: number;   // tropical ascendant
    mc: number;          // tropical Midheaven
    armc: number;
    vertex: number;
    equatorialAscendant: number;
    kochCoAscendant: number;
    munkaseyCoAscendant: number;
    munkaseyPolarAscendant: number;
    error?: string;
  }

  /**
   * Calculates house cusps.
   * hsys: 'W' = Whole Sign, 'P' = Placidus, etc.
   * Returns tropical house cusps; subtract ayanamsa to get sidereal.
   */
  function swe_houses(
    tjd_ut: number,
    geolat: number,
    geolon: number,
    hsys: string
  ): HousesResult;
}
