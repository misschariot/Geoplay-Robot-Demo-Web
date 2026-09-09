const GEOPLAY_WINNER_PROFILES = [
  {
    id: "jessica-m",
    player: "Jessica M.",
    amount: "$2,500",
    avatar: "/avatars/avatar-1.png",
  },
  {
    id: "marcus-t",
    player: "Marcus T.",
    amount: "$1,200",
    avatar: "/avatars/avatar-2.png",
  },
  {
    id: "sarah-k",
    player: "Sarah K.",
    amount: "$875",
    avatar: "/avatars/avatar-3.png",
  },
  {
    id: "daniel-r",
    player: "Daniel R.",
    amount: "$640",
    avatar: "/avatars/avatar-4.png",
  },
  {
    id: "amanda-p",
    player: "Amanda P.",
    amount: "$525",
    avatar: "/avatars/avatar-5.png",
  },
  {
    id: "kevin-l",
    player: "Kevin L.",
    amount: "$450",
    avatar: "/avatars/avatar-6.png",
  },
  {
    id: "nicole-s",
    player: "Nicole S.",
    amount: "$375",
    avatar: "/avatars/avatar-7.png",
  },
  {
    id: "jason-w",
    player: "Jason W.",
    amount: "$300",
    avatar: "/avatars/avatar-8.png",
  },
  {
    id: "melissa-c",
    player: "Melissa C.",
    amount: "$275",
    avatar: "/avatars/avatar-9.png",
  },
  {
    id: "brian-h",
    player: "Brian H.",
    amount: "$225",
    avatar: "/avatars/avatar-10.png",
  },
];

export function getGeoPlayWinners(casino) {
  const games = Array.isArray(casino?.games) ? casino.games : [];

  if (games.length === 0) {
    return [];
  }

  return GEOPLAY_WINNER_PROFILES.map((profile, index) => ({
    ...profile,
    game: games[index % games.length].name,
  }));
}

export default GEOPLAY_WINNER_PROFILES;