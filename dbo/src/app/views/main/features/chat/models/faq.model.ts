export interface AccordionItems {
  id: number
  order: number
  title: string
  answer: {
    id: number
    text: string
    actionType: {
      text: string
      link:string
    }
  }
}

export interface QuestionDto {
  id: number;
  title: string;
  order: number;
}

export type Faqlist = {
  id: number;
  title: string;
  questions: QuestionDto[];
  order: number;
}
