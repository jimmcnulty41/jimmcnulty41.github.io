export const SKILL_DATA = [
  {
    skillName: "CSS",
    examples: ["climb", "extrahop", "epic", "imageViewer"],
  },
  {
    skillName: "HTML",
    examples: ["climb", "extrahop", "epic", "imageViewer"],
  },
  {
    skillName: "Hand Sawing",
    examples: ["the tower", "the bed", "the roach motel", "the desk"],
  },
  {
    skillName: "Machine sawing",
    examples: ["the triangles"],
  },
  {
    skillName: "Knots",
    examples: ["the tower"],
  },
  {
    skillName: "Illustration",
    examples: ["sketchery"],
  },
  {
    skillName: "Animation",
    examples: ["jim.mcnulty.site/gifs", "squatbot", "404page"],
  },
  {
    skillName: "d3",
    examples: ["observable"],
  },
  {
    skillName: "react",
    examples: ["extrahop", "climb"],
  },
  {
    skillName: "webComponents",
    examples: ["imageViewer"],
  },
  {
    skillName: "javascript",
    examples: ["imageViewer", "climb", "extrahop"],
  },
  {
    skillName: "three.js",
    examples: ["sketchery"],
  },
];

export const PROJECT_PAGES: { [key: string]: string } = {
  climb: "./projectPages/climb.html",
  sketchery: "https://jim.mcnulty.site/sims/sketchery.html",
};

export const EXAMPLES = SKILL_DATA.flatMap((s) => s.examples);
export const SKILLS = SKILL_DATA.map((x) => x.skillName);
EXAMPLES.forEach((e) => {
  if (SKILLS.includes(e)) {
    throw new Error(
      `JIM data validation: skill and example share name: "${e}"`
    );
  }
});
