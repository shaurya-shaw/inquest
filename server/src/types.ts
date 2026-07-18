export interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

export interface Room {
  roomId: string;
  hostId: string;
  players: Player[];
}
