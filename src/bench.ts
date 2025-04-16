import { Shapes } from "./shapes/index.ts";

// Read and parse data ahead of time to not influence benchmark
const rawdata = Deno.readTextFileSync("./deviations.json");
const parsed = JSON.parse(rawdata);

const InternalNoteShape = Shapes.object("InternalNote", {
  whatHappened: Shapes.string(),
  actionsTaken: Shapes.string(),
});

const DeviationInfoShape = Shapes.object("DeviationInfo", {
  internalNote: InternalNoteShape,
  isOnCallInvolved: Shapes.boolean(),
  //potentialSanctionNok: Shapes.optional(Shapes.number()),
  //potentialCompensationNok: Shapes.optional(Shapes.number()),
  //description: Shapes.optional(Shapes.string()),
  //descriptionInEnglish: Shapes.optional(Shapes.string()),
  publishedToWebsite: Shapes.boolean(),
  notifiedSubscribers: Shapes.optional(Shapes.boolean()),
  visibleFrom: Shapes.optional(Shapes.string()),
  //visibleTo: Shapes.optional(Shapes.string()),
  relatedDeviationAlertId: Shapes.array(Shapes.string()),
});

const UserInfoShape = Shapes.object("UserInfo", {
  id: Shapes.string(),
  name: Shapes.string(),
  email: Shapes.string(),
});

const DeviationShape = Shapes.object("Deviation", {
  "#type": Shapes.string(),
  id: Shapes.string(),
  lineId: Shapes.string(),
  lineName: Shapes.string(),
  publicCode: Shapes.string(),
  info: DeviationInfoShape,
  //reason: Shapes.string(),
  creator: UserInfoShape,
  createdAt: Shapes.string(),
  updatedAt: Shapes.string(),
});

const LoadDeviationsResponseShape = Shapes.object("LoadDeviationsResponse", {
  deviations: Shapes.array(DeviationShape),
});

Deno.bench({
  ignore: true,
  name: "Check list of deviations",
  fn() {
    LoadDeviationsResponseShape.checkFn(parsed);
  },
});

Deno.bench({
  ignore: true,
  name: "Build Shapes and check list of deviations",
  fn() {
    const InternalNoteShape = Shapes.object("InternalNote", {
      whatHappened: Shapes.string(),
      actionsTaken: Shapes.string(),
    });

    const DeviationInfoShape = Shapes.object("DeviationInfo", {
      internalNote: InternalNoteShape,
      isOnCallInvolved: Shapes.boolean(),
      //potentialSanctionNok: Shapes.optional(Shapes.number()),
      //potentialCompensationNok: Shapes.optional(Shapes.number()),
      //description: Shapes.optional(Shapes.string()),
      //descriptionInEnglish: Shapes.optional(Shapes.string()),
      publishedToWebsite: Shapes.boolean(),
      notifiedSubscribers: Shapes.optional(Shapes.boolean()),
      visibleFrom: Shapes.optional(Shapes.string()),
      //visibleTo: Shapes.optional(Shapes.string()),
      relatedDeviationAlertId: Shapes.array(Shapes.string()),
    });

    const UserInfoShape = Shapes.object("UserInfo", {
      id: Shapes.string(),
      name: Shapes.string(),
      email: Shapes.string(),
    });

    const DeviationShape = Shapes.object("Deviation", {
      "#type": Shapes.string(),
      id: Shapes.string(),
      lineId: Shapes.string(),
      lineName: Shapes.string(),
      publicCode: Shapes.string(),
      info: DeviationInfoShape,
      //reason: Shapes.string(),
      creator: UserInfoShape,
      createdAt: Shapes.string(),
      updatedAt: Shapes.string(),
    });

    const LoadDeviationsResponseShape = Shapes.object(
      "LoadDeviationsResponse",
      {
        deviations: Shapes.array(DeviationShape),
      },
    );

    LoadDeviationsResponseShape.checkFn(parsed);
  },
});
