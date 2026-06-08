
export enum positionEnum {
  PASSIVE_USER = 'PASSIVE_USER',
  DIRECTOR = 'DIRECTOR',
  HEAD_OF_FINANCE = 'HEAD_OF_FINANCE',
  FINANCE_MANAGER = 'FINANCE_MANAGER',
}

export const positions: {[key in positionEnum as string]: string} = {
  [positionEnum.DIRECTOR]: 'Директор',
  [positionEnum.HEAD_OF_FINANCE]: 'Глав. Бух.',
  [positionEnum.FINANCE_MANAGER]: 'Бухгалтер',
  [positionEnum.PASSIVE_USER]: 'Пассивный пользователь',
}
