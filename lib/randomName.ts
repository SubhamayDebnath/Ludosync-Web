const ADJECTIVES = [
  "Swift", "Lucky", "Sneaky", "Mighty", "Clever", "Brave", "Jolly", "Fuzzy",
  "Sizzling", "Turbo", "Golden", "Silent", "Dizzy", "Bouncy", "Spicy", "Zesty",
  "Rowdy", "Nimble", "Chilly", "Wobbly", "Grumpy", "Sunny", "Crafty", "Speedy",
];

const NOUNS = [
  "Tiger", "Falcon", "Panda", "Ninja", "Rocket", "Wizard", "Otter", "Dragon",
  "Cobra", "Pirate", "Phoenix", "Yeti", "Raccoon", "Cheetah", "Goblin", "Panther",
  "Koala", "Samurai", "Gecko", "Badger", "Viking", "Penguin", "Mongoose", "Griffin",
];

/** Generates a fun, memorable default display name for a guest — e.g. "Sizzling Cobra 42". */
export function randomGuestName(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 90) + 10;
  return `${adjective} ${noun} ${number}`;
}
