export const CONFIRM_TITLE = 'Are You Sure?';
export const GO_BACK_LABEL = 'Go Back';
export const STAY_LABEL = 'Stay';

export function confirmMessage(activityName: string) {
  return `You will lose all your progress on ${activityName} if you go back.`;
}
