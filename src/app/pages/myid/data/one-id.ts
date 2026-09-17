export interface OneIdInstructionStep {
  number: number;
  title: string;
  description: string;
}

export const ONE_ID_INSTRUCTION_STEPS: OneIdInstructionStep[] = [
  { number: 1, title: 'flow.one_id.instruction.step.authorize.title', description: 'flow.one_id.instruction.step.authorize.description' },
  {
    number: 2,
    title: 'flow.one_id.instruction.step.legal_entity.title',
    description: 'flow.one_id.instruction.step.legal_entity.description',
  },
  { number: 3, title: 'flow.one_id.instruction.step.inn.title', description: 'flow.one_id.instruction.step.inn.description' },
  { number: 4, title: 'flow.one_id.instruction.step.management.title', description: 'flow.one_id.instruction.step.management.description' },
  {
    number: 5,
    title: 'flow.one_id.instruction.step.select_bank.title',
    description: 'flow.one_id.instruction.step.select_bank.description',
  },
  { number: 6, title: 'flow.one_id.instruction.step.allow.title', description: 'flow.one_id.instruction.step.allow.description' },
  { number: 7, title: 'flow.one_id.instruction.step.done.title', description: 'flow.one_id.instruction.step.done.description' },
];

/** After this step number the "for individual entrepreneurs skip steps 2-3" note is shown. */
export const ONE_ID_INSTRUCTION_NOTE_AFTER_STEP = 3;
