export interface OneIdInstructionStep {
  number: number;
  title: string;
  description: string;
}

export const ONE_ID_INSTRUCTION_STEPS: OneIdInstructionStep[] = [
  {
    number: 1,
    title: 'flow.one_id.instruction.step.authorize.title',
    description: 'flow.one_id.instruction.step.authorize.description',
  },
  {
    number: 2,
    title: 'flow.one_id.instruction.step.management.title',
    description: 'flow.one_id.instruction.step.management.description',
  },
  {
    number: 3,
    title: 'flow.one_id.instruction.step.allow.title',
    description: 'flow.one_id.instruction.step.allow.description',
  },
  {
    number: 4,
    title: 'flow.one_id.instruction.step.check.title',
    description: 'flow.one_id.instruction.step.check.description',
  },
];
