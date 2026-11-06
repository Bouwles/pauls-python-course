// The first six gestures: standing, a wave, a cheer, a think, a point and a thumbs up.
import { arm, shoulders } from "../kit";
import { defineGestures } from "./registry";

defineGestures([
  {
    id: "idle",
    label: "stands",
    arms: { left: true, right: true },
    beats: 1,
    ms: 450,
    tags: ["idle", "listen", "wait"],
    faces: ["neutral"],
    draw: () => {},
  },
  {
    id: "wave",
    label: "waves",
    arms: { left: true, right: false },
    beats: 6,
    ms: 130,
    tags: ["greet", "bye"],
    faces: ["pleased"],
    draw: (g, p, beat) => {
      const { R } = shoulders(p);
      const sway = [0, 1, 2, 1, 0, -1][beat % 6]!;
      arm(g, p, [R - 1, 43], [R + 3, 37], [R + 3 + sway, 31], "open");
    },
  },
  {
    id: "cheer",
    label: "cheers",
    arms: { left: false, right: false },
    beats: 2,
    ms: 200,
    tags: ["celebrate"],
    faces: ["laughing", "proud"],
    draw: (g, p, beat) => {
      const { L, R } = shoulders(p);
      const lift = beat % 2;
      arm(g, p, [L + 1, 43], [L - 3, 37], [L - 2, 30 - lift], "fist", true);
      arm(g, p, [R - 1, 43], [R + 3, 37], [R + 2, 30 - lift], "fist");
    },
  },
  {
    id: "think",
    label: "thinks, hand on chin",
    arms: { left: true, right: false },
    beats: 2,
    ms: 420,
    tags: ["think"],
    faces: ["thinking"],
    draw: (g, p, beat) => {
      const { R } = shoulders(p);
      arm(g, p, [R - 1, 43], [R + 2, 50], [28, 37 - (beat % 2)], "fist", true);
    },
  },
  {
    id: "point",
    label: "points",
    arms: { left: true, right: false },
    beats: 2,
    ms: 420,
    tags: ["explain"],
    faces: ["pleased", "talking"],
    draw: (g, p, beat) => {
      const { R } = shoulders(p);
      arm(g, p, [R - 1, 43], [R + 2, 41], [R + 5 + (beat % 2), 40], "point");
    },
  },
  {
    id: "thumbs",
    label: "gives a thumbs up",
    arms: { left: true, right: false },
    beats: 2,
    ms: 420,
    tags: ["approve", "encourage"],
    faces: ["proud", "pleased"],
    draw: (g, p, beat) => {
      const { R } = shoulders(p);
      arm(g, p, [R - 1, 43], [R + 2, 49], [R + 2, 41 - (beat % 2)], "thumb", true);
    },
  },
]);
