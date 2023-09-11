export enum TaskStatuses {
  New = 0,
  Completed = 2,

}

export enum TaskPriorities {
  Low = 0,

}

export const ResultCode = {
  Success: 0,
  Error: 1,
  Captcha: 10,
} as const;
