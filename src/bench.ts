import { Shapes } from "./shapes/index.ts";

// Read and parse data ahead of time to not influence benchmark
const rawdata = Deno.readTextFileSync("./deviations.json");
const parsed = JSON.parse(rawdata);

const InternalNote = Shapes.object("InternalNote", {
  whatHappened: Shapes.string(),
  actionsTaken: Shapes.string(),
});

const DeviationInfo = Shapes.object("DeviationInfo", {
  internalNote: InternalNote,
  isOnCallInvolved: Shapes.boolean(),
  potentialSanctionNok: Shapes.optional(Shapes.number()),
  potentialCompensationNok: Shapes.optional(Shapes.number()),
  description: Shapes.optional(Shapes.string()),
  descriptionInEnglish: Shapes.optional(Shapes.string()),
  publishedToWebsite: Shapes.boolean(),
  notifiedSubscribers: Shapes.optional(Shapes.boolean()),
  visibleFrom: Shapes.optional(Shapes.string()),
  visibleTo: Shapes.optional(Shapes.string()),
  relatedDeviationAlertId: Shapes.array(Shapes.string()),
});

const UserInfo = Shapes.object("UserInfo", {
  id: Shapes.string(),
  name: Shapes.string(),
  email: Shapes.string(),
});

const Departure = Shapes.object("Departure", {
  departureId: Shapes.string(),
  departureTime: Shapes.string(),
  arrivalTime: Shapes.string(),
  departureQuayId: Shapes.string(),
  departureQuayName: Shapes.string(),
  arrivalQuayId: Shapes.string(),
  arrivalQuayName: Shapes.string(),
  serviceJourneyId: Shapes.optional(Shapes.string()),
});

const DepartureFilter = Shapes.object("DepartureFilter", {
  lineId: Shapes.string(),
  blockId: Shapes.optional(Shapes.string()),
  blockName: Shapes.optional(Shapes.string()),
  from: Shapes.string(),
  to: Shapes.optional(Shapes.string()),
  departures: Shapes.optional(Shapes.array(Departure)),
});

const DepartureChange = Shapes.object("DepartureChange", {
  departure: Departure,
  isCancelled: Shapes.boolean(),
  isRestored: Shapes.boolean(),
  newArrivalQuayId: Shapes.optional(Shapes.string()),
  newArrivalQuayName: Shapes.optional(Shapes.string()),
  newDepartureTime: Shapes.optional(Shapes.string()),
  newArrivalTime: Shapes.optional(Shapes.string()),
});

const TravelDetail = Shapes.object("TravelDetail", {
  extraTripId: Shapes.string(),
  departureTime: Shapes.string(),
  arrivalTime: Shapes.string(),
  departureQuayId: Shapes.string(),
  departureQuayName: Shapes.string(),
  arrivalQuayId: Shapes.string(),
  arrivalQuayName: Shapes.string(),
});

const Deviation = Shapes.object("Deviation", {
  "#type": Shapes.string(),
  id: Shapes.string(),
  lineId: Shapes.string(),
  lineName: Shapes.string(),
  publicCode: Shapes.string(),
  info: DeviationInfo,
  reason: Shapes.optional(Shapes.string()),
  departureFilter: Shapes.optional(DepartureFilter),
  changedDepartures: Shapes.optional(Shapes.array(DepartureChange)),
  travelDetails: Shapes.optional(Shapes.array(TravelDetail)),
  creator: UserInfo,
  createdAt: Shapes.string(),
  updatedAt: Shapes.string(),
});

const LoadDeviationsResponse = Shapes.object("LoadDeviationsResponse", {
  deviations: Shapes.array(Deviation),
});

if (LoadDeviationsResponse.checkFn(parsed)) {
  console.log(parsed.deviations.length);
}

Deno.bench({
  name: "Check list of deviations",
  fn() {
    LoadDeviationsResponse.checkFn(parsed);
  },
});
