"use client";

import { TownMap, HIDDEN_DENNISES } from "../world/TownMap";
import { useNight } from "../world/useNight";
import { BRAND } from "@/lib/brand";

const none = new Set(HIDDEN_DENNISES.map((d) => d.id));

export function LandingMap() {
  const night = useNight();
  return (
    <TownMap
      openBuildings={new Set(["workshop"])}
      openActs={new Set(["harbour-front"])}
      selected={null}
      onSelect={() => {}}
      foundDennises={none}
      onFindDennis={() => {}}
      night={night}
      label={`The map of ${BRAND.townName}. Only the Harbour Front is open at the start; the other districts are in shadow until you get there.`}
    />
  );
}
