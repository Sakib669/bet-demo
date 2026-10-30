export interface WheelSegment {
  index: number;
  multiplier: number;
  color: string;
  label: string;
}

export const CRAZY_WHEEL_SEGMENTS: WheelSegment[] = [1, 2, 1, 5, 1, 2, 10, 1, 2, 20, 1, 50].map((multiplier, index) => ({
  index,
  multiplier,
  color: ["#345441", "#8fbda3", "#345441", "#c4e77d", "#345441", "#8fbda3", "#d9ae70", "#345441", "#8fbda3", "#e7cd83", "#345441", "#de8d87"][index],
  label: `${multiplier}X`,
}));
