// client/src/data/trainingModules.ts

export type TrainingQuestion = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
};

export type TrainingModule = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  estimatedMinutes: number;
  level: "basic" | "advanced";
  videoSrc?: string; // you will fill this later
  questions: TrainingQuestion[];
};

export const residentTrainingModules: TrainingModule[] = [
  {
    id: "types-of-waste",
    shortTitle: "Types of Waste",
    title: "Understanding Types of Waste & Segregation",
    description:
      "Learn the difference between wet, dry, and hazardous waste, and how to separate them correctly at home.",
    estimatedMinutes: 3,
    level: "basic",
    // TODO: when you add your video, update this path
    // Example: "/videos/module1-waste-types.mp4" or import and use that
    videoSrc: "/videos/module1-waste-types.mp4",
    questions: [
      {
        id: "q1",
        text: "Vegetable peels and leftover food should go into:",
        options: ["Dry waste bin", "Wet waste bin", "Hazardous waste bin"],
        correctIndex: 1,
      },
      {
        id: "q2",
        text: "Plastic bottles should go into:",
        options: ["Wet waste bin", "Dry waste bin", "Hazardous waste bin"],
        correctIndex: 1,
      },
      {
        id: "q3",
        text: "Used batteries and sanitary pads are:",
        options: ["Normal dry waste", "Wet waste", "Domestic hazardous waste"],
        correctIndex: 2,
      },
    ],
  },
  {
    id: "home-composting",
    shortTitle: "Home Composting",
    title: "Basics of Home Composting",
    description:
      "Understand what a compost kit is, what can go into compost, and how it reduces landfill waste.",
    estimatedMinutes: 3,
    level: "basic",
    videoSrc: "/videos/module2-composting.mp4",
    questions: [
      {
        id: "q1",
        text: "Composting mainly uses:",
        options: ["Plastic waste", "Kitchen wet waste", "E-waste"],
        correctIndex: 1,
      },
      {
        id: "q2",
        text: "Compost can be used as:",
        options: ["Fertilizer for plants", "Plastic bags", "Drinking water"],
        correctIndex: 0,
      },
      {
        id: "q3",
        text: "Which of these should NOT go into compost?",
        options: ["Vegetable peels", "Cooked rice", "Batteries"],
        correctIndex: 2,
      },
    ],
  },
  {
    id: "responsible-disposal",
    shortTitle: "Responsible Disposal",
    title: "Responsible Waste Disposal & Community Cleanliness",
    description:
      "Learn what not to do: no open dumping, no burning, and how to keep your street and ward clean.",
    estimatedMinutes: 2,
    level: "basic",
    videoSrc: "/videos/module3-responsible-disposal.mp4",
    questions: [
      {
        id: "q1",
        text: "Burning waste in open areas:",
        options: [
          "Is a good way to reduce volume",
          "Causes air pollution and is harmful",
          "Is always allowed",
        ],
        correctIndex: 1,
      },
      {
        id: "q2",
        text: "Throwing waste in drains can cause:",
        options: [
          "Nothing special",
          "Blockages and flooding",
          "Road repair",
        ],
        correctIndex: 1,
      },
      {
        id: "q3",
        text: "Who is responsible for keeping the street clean?",
        options: [
          "Only the collector",
          "Only the municipality",
          "Every resident plus the municipal workers",
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: "rules-and-beacon-score",
    shortTitle: "Rules & Beacon Score",
    title: "Local Rules, Penalties & Beacon Score",
    description:
      "Understand how Beacon Score works, what penalties apply, and how you can earn a better score and rewards.",
    estimatedMinutes: 2,
    level: "basic",
    videoSrc: "/videos/module4-rules-beacon-score.mp4",
    questions: [
      {
        id: "q1",
        text: "Beacon Score represents:",
        options: [
          "Your electricity usage",
          "How responsibly you manage your waste",
          "Your income",
        ],
        correctIndex: 1,
      },
      {
        id: "q2",
        text: "If you frequently mix wet and dry waste, your Beacon Score will:",
        options: ["Increase", "Stay same", "Decrease"],
        correctIndex: 2,
      },
      {
        id: "q3",
        text: "A good Beacon Score can lead to:",
        options: [
          "Incentives/recognition",
          "More penalties",
          "No effect at all",
        ],
        correctIndex: 0,
      },
    ],
  },
];


// ... existing residentTrainingModules + types stay as they are

export const collectorTrainingModules: TrainingModule[] = [
  {
    id: "worker-safety",
    shortTitle: "Worker Safety",
    title: "Safety & PPE for Waste Workers",
    description:
      "Learn how to use gloves, masks, boots, and other PPE correctly to avoid injuries and infections while working.",
    estimatedMinutes: 3,
    level: "basic",
    videoSrc: "/videos/collector-module1-safety.mp4", // put file later
    questions: [
      {
        id: "q1",
        text: "Why should you always wear gloves while handling waste?",
        options: [
          "To look professional",
          "To protect your hands from germs and sharp objects",
          "To work faster",
        ],
        correctIndex: 1,
      },
      {
        id: "q2",
        text: "Which of these is part of a PPE kit?",
        options: ["Shoes only", "Mask, gloves, boots, jacket", "Cap"],
        correctIndex: 1,
      },
      {
        id: "q3",
        text: "If your PPE is damaged, you should:",
        options: [
          "Ignore it and continue working",
          "Immediately report and request replacement",
          "Give it to a resident",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "sop-collection",
    shortTitle: "Collection SOP",
    title: "Standard Operating Procedure for Collection",
    description:
      "Understand the step-by-step process for safe door-to-door collection, handling segregated waste, and using BinBeacon.",
    estimatedMinutes: 3,
    level: "basic",
    videoSrc: "/videos/collector-module2-sop.mp4",
    questions: [
      {
        id: "q1",
        text: "When a house gives mixed waste (not segregated), you should:",
        options: [
          "Quietly take it away",
          "Throw it on the street",
          "Inform them politely and report via the app if repeated",
        ],
        correctIndex: 2,
      },
      {
        id: "q2",
        text: "Which waste should be kept separate during collection?",
        options: [
          "Wet and dry only",
          "Hazardous waste separately",
          "All of the above (wet, dry, hazardous)",
        ],
        correctIndex: 2,
      },
      {
        id: "q3",
        text: "What should you do if you see overflow on the street during your route?",
        options: [
          "Ignore it",
          "Report it as an overflow issue in BinBeacon",
          "Wait for someone else to report",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "dignity-rights",
    shortTitle: "Dignity & Rights",
    title: "Dignity, Rights & Welfare of Sanitation Workers",
    description:
      "Know your rights, welfare schemes, and how BinBeacon supports safer and more dignified working conditions.",
    estimatedMinutes: 2,
    level: "basic",
    videoSrc: "/videos/collector-module3-rights.mp4",
    questions: [
      {
        id: "q1",
        text: "Waste work should be done with:",
        options: [
          "Shame",
          "Dignity and respect",
          "Silence only",
        ],
        correctIndex: 1,
      },
      {
        id: "q2",
        text: "If you face harassment or unsafe conditions, you should:",
        options: [
          "Keep quiet",
          "Immediately inform your supervisor/authority",
          "Stop coming to work",
        ],
        correctIndex: 1,
      },
      {
        id: "q3",
        text: "Government and ULBs should provide:",
        options: [
          "Only salary",
          "No support",
          "PPE, training, and health support",
        ],
        correctIndex: 2,
      },
    ],
  },
];
