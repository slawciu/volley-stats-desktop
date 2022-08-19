export const actions = [
  [
    {
      id: "free-ball",
      name: "Wolna Piłka",
      result: 0,
      type: "neutral",
    },
    {
      id: "error",
      name: "Błąd",
      result: -1,
      type: "error",
    },
  ],
  [
    { id: "block-kill", name: "Blok", result: 1, type: "block" },
    { id: "block", name: "Blok", result: 0, type: "block" },
    { id: "block-error", name: "Blok", result: -1, type: "block" },
  ],
  [
    { id: "attack-kill", name: "Atak", result: 1, type: "attack" },
    { id: "attack", name: "Atak", result: 0, type: "attack" },
    { id: "attack-error", name: "Atak", result: -1, type: "attack" },
  ],
  [
    { id: "serve-kill", name: "Zagrywka", result: 1, type: "serve" },
    { id: "serve", name: "Zagrywka", result: 0, type: "serve" },
    {
      id: "serve-error",
      name: "Zagrywka",
      result: -1,
      type: "serve",
    },
  ],
  [
    {
      id: "reception-excellent",
      name: "Przyjęcie",
      result: 0,
      type: "receive",
    },
    {
      id: "reception",
      name: "Przyjęcie",
      result: 0,
      type: "receive",
    },
    {
      id: "reception-error",
      name: "Przyjęcie",
      result: -1,
      type: "receive",
    },
  ],
  [
    {
      id: "opponent-point",
      name: "Punkt przeciwnika",
      result: -1,
      type: "error",
    },
    {
      id: "opponent-error",
      name: "Błąd przeciwnika",
      result: 1,
      type: "error",
    },
  ],
  
];