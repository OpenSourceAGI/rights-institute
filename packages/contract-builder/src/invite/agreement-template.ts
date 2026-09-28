/**
 * The employment agreement a job seeker pre-fills before inviting their
 * employer. Answers are woven into plain-text paragraphs, so from then on
 * every paragraph is just text either party can rewrite.
 */

export interface AgreementParagraph {
  id: string;
  heading: string;
  body: string;
}

export interface SeekerAnswers {
  seekerName: string;
  seekerEmail: string;
  employerName: string;
  employerEmail: string;
  position: string;
  startDate: string;
  employmentType: 'full-time' | 'part-time' | 'contract-to-hire';
  salary: string;
  payFrequency: string;
  workLocation: string;
  hoursPerWeek: string;
  benefits: string;
  paidTimeOff: string;
  probationDays: string;
  noticeDays: string;
  governingState: string;
}

export const EMPTY_ANSWERS: SeekerAnswers = {
  seekerName: '',
  seekerEmail: '',
  employerName: '',
  employerEmail: '',
  position: '',
  startDate: '',
  employmentType: 'full-time',
  salary: '',
  payFrequency: 'bi-weekly',
  workLocation: '',
  hoursPerWeek: '40',
  benefits: '',
  paidTimeOff: '',
  probationDays: '90',
  noticeDays: '14',
  governingState: '',
};

const blank = (value: string, placeholder = '__________') => value.trim() || placeholder;

let counter = 0;
export function newParagraphId() {
  counter += 1;
  return `p${Date.now().toString(36)}${counter}`;
}

export function agreementTitle(a: SeekerAnswers) {
  return a.position.trim() ? `Employment Agreement — ${a.position.trim()}` : 'Employment Agreement';
}

export function buildEmploymentParagraphs(a: SeekerAnswers): AgreementParagraph[] {
  const employer = blank(a.employerName, 'the Employer');
  const employee = blank(a.seekerName, 'the Employee');
  const type = a.employmentType.replace(/-/g, ' ');

  const sections: [string, string][] = [
    [
      'Parties',
      `This Employment Agreement (the "Agreement") is entered into between ${employer} ("Employer") and ${employee} ("Employee").`,
    ],
    [
      'Position and Duties',
      `Employer agrees to employ Employee on a ${type} basis as ${blank(a.position)}. Employee will perform the duties customarily associated with this position and other reasonable duties assigned by Employer.`,
    ],
    [
      'Start Date and Term',
      `Employment begins on ${blank(a.startDate)} and continues until ended by either party under the Termination section of this Agreement.`,
    ],
    [
      'Work Location and Hours',
      `Employee will work ${blank(a.workLocation, 'at a location agreed by the parties')}, for approximately ${blank(a.hoursPerWeek)} hours per week.`,
    ],
    [
      'Compensation',
      `Employer will pay Employee ${blank(a.salary)}, paid ${blank(a.payFrequency)} in accordance with Employer's regular payroll practices and subject to lawful withholdings.`,
    ],
    [
      'Benefits',
      a.benefits.trim()
        ? `Employee is eligible for the following benefits: ${a.benefits.trim()}.`
        : "Employee is eligible for the benefits Employer provides to similarly situated employees, subject to each plan's terms.",
    ],
    [
      'Paid Time Off',
      a.paidTimeOff.trim()
        ? `Employee will receive ${a.paidTimeOff.trim()} of paid time off per year, in addition to public holidays observed by Employer.`
        : "Employee will receive paid time off under Employer's standard policy, in addition to public holidays observed by Employer.",
    ],
    [
      'Introductory Period',
      `The first ${blank(a.probationDays)} days of employment are an introductory period during which both parties will evaluate the fit of the role.`,
    ],
    [
      'Termination',
      `Either party may end this Agreement by giving ${blank(a.noticeDays)} days' written notice. Employer may end this Agreement immediately for cause, including serious misconduct or a material breach of this Agreement.`,
    ],
    [
      'Confidentiality',
      "Employee will keep Employer's non-public business information confidential during and after employment, except where disclosure is required by law or protected by it.",
    ],
    [
      'Intellectual Property',
      "Work product Employee creates within the scope of employment belongs to Employer. Employee keeps ownership of anything created on their own time, without Employer's resources, and unrelated to Employer's business.",
    ],
    [
      'Governing Law',
      `This Agreement is governed by the laws of ${blank(a.governingState, 'the state where Employee primarily works')}.`,
    ],
    [
      'Entire Agreement and Electronic Signatures',
      'This Agreement is the entire agreement between the parties about its subject and may be changed only in writing signed by both parties. The parties agree to sign electronically, and electronic signatures have the same effect as handwritten ones.',
    ],
  ];

  return sections.map(([heading, body]) => ({ id: newParagraphId(), heading, body }));
}
