export const userTypes = ['UNKNOWN' , 'PRIVATE' , 'CORPORATE' , 'PENSION' , 'SALARY'] as const;

export type UserType = (typeof userTypes)[number];
