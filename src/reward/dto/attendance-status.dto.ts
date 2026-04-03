export class AttendanceStatusDto {
  totalDays: number;
  claimedToday: boolean;
  nextReward: {
    dayNumber: number;
    rewardType: string;
    rewardAmount: number;
  } | null;
}
