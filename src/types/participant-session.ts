export type ParticipantSession = {
  session_id: string;
  meeting_id: string;
  display_name: string;
  is_host: boolean;
  status: string;
  joined_at: string;
  left_at: string | null;
  password_verified_at: string | null;
};

export type GuestJoinActionState = {
  error: string;
};
