export interface BlogSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  sections: BlogSection[];
}

export const blogArticles: BlogArticle[] = [
  {
    slug: 'attendance-policy-best-practices-2026',
    title: 'Attendance Policy Best Practices for Growing Teams in 2026',
    description:
      'A practical guide to designing an attendance policy that keeps employees accountable without slowing your HR team down.',
    date: '2026-07-20',
    readTime: '6 min read',
    category: 'Attendance',
    sections: [
      {
        heading: 'Why your attendance policy matters more than you think',
        paragraphs: [
          'An attendance policy is one of the first documents new employees read and one of the most common sources of HR disputes. A well-written policy sets clear expectations for check-in, check-out, breaks, remote work, and leave, so employees never have to guess what is acceptable.',
          'For growing teams, the stakes are higher. With multiple departments, shifts, and office locations, an informal "just tell your manager" approach stops scaling and creates inconsistent decisions that can invite compliance problems later.',
        ],
      },
      {
        heading: 'Start with the basics: definition of the workday',
        paragraphs: [
          'Before adding rules, define the fundamentals: standard work hours, break entitlements, grace periods, and how overtime is treated. Every policy should answer these four questions explicitly.',
        ],
        list: [
          'What are the standard working hours and are they flexible within a band?',
          'How long are breaks, and are they paid or unpaid?',
          'How many minutes of late arrival is tolerated before it counts as a late mark?',
          'How is overtime approved, tracked, and compensated?',
        ],
      },
      {
        heading: 'Make exceptions explicit',
        paragraphs: [
          'Ambiguity is where disputes come from. State clearly how employees request leave, who approves it, how many consecutive days require special approval, and what happens during public holidays. If your team has field or remote employees, define how their attendance is verified so the policy does not silently assume everyone works from the same office.',
        ],
      },
      {
        heading: 'Enforce consistently with the same rules for everyone',
        paragraphs: [
          'The best policy in the world fails when it is applied unevenly. Use a single system for all employees so attendance records, late marks, and leave balances are captured the same way across departments. Consistent, system-driven enforcement also gives managers an audit trail if an individual dispute ever escalates.',
        ],
      },
      {
        heading: 'Review and communicate it regularly',
        paragraphs: [
          'Policies age fast. Review yours at least once a year, when you cross new headcount milestones, or whenever you introduce new working arrangements such as hybrid or field tracking. Communicate changes with enough notice, and keep the latest version in one place everyone can access.',
        ],
      },
    ],
  },
  {
    slug: 'payroll-compliance-india-guide',
    title: 'Payroll Compliance in India: A Practical Guide for HR Teams',
    description:
      'What Indian companies need to get right for statutory payroll compliance, from PF and ESI to TDS and the newer labor codes.',
    date: '2026-07-10',
    readTime: '8 min read',
    category: 'Payroll',
    sections: [
      {
        heading: 'Payroll compliance is really about payroll data',
        paragraphs: [
          'Every statutory obligation in India — EPF, ESIC, TDS, professional tax — starts with accurate employee master data. If the PAN, UAN, bank account, or date of joining is wrong in your records, the error multiplies across every downstream calculation and every statutory return.',
          'That is why the first step of payroll compliance is not filing, it is data hygiene: verify employee details at onboarding and re-verify them whenever a change is reported.',
        ],
      },
      {
        heading: 'The statutory pillars most companies must handle',
        paragraphs: [
          'Depending on your size and state, the core statutory requirements are well established. Make sure your payroll process covers each one and tracks the applicable thresholds.',
        ],
        list: [
          'EPF and EPS: monthly contribution on eligible salary components, with employee and employer shares.',
          'ESIC: applicable once employee wages cross the threshold, covering medical benefits.',
          'TDS: withholding income tax at the correct slab and remitting it within the due date.',
          'Professional tax: state-specific, deducted and remitted monthly or annually depending on the state.',
          'Gratuity: accrual and payment obligations under the Gratuity Act.',
        ],
      },
      {
        heading: 'The new labor codes are coming — plan for them',
        paragraphs: [
          'India has consolidated 29 central labor laws into four codes: wages, industrial relations, social security, and occupational safety. Even while implementation timelines continue to shift at the state level, payroll teams should design systems that can handle a unified wage definition and new compliance obligations without a rebuild.',
          'The safest approach is to keep salary components clean and well-labelled in your payroll system, so remapping to the new definitions is a configuration change rather than a data migration.',
        ],
      },
      {
        heading: 'Reconcile before you file',
        paragraphs: [
          'The most common payroll errors are the most expensive: mismatches between the payroll register and statutory challans, or between ESIC contribution details and the registered employee list. Build a monthly reconciliation checklist and assign ownership for each filing so nothing depends on one person remembering it.',
        ],
        list: [
          'PF challan matches the contribution register (monthly).',
          'ESI challan and member count match the ESIC portal (monthly).',
          'TDS challans reconcile with Form 26Q/24Q (quarterly).',
          'State professional tax challans reconcile with the register (per state cycle).',
        ],
      },
      {
        heading: 'Keep the audit trail',
        paragraphs: [
          'Compliance is tested during inspections and audits, not during the monthly run. Keep every change to payroll data versioned and attributable, retain registers for the statutory periods, and make sure salary revisions or arrear calculations can be explained line by line. A clean audit trail turns an inspection from a crisis into a routine exercise.',
        ],
      },
    ],
  },
  {
    slug: 'field-workforce-tracking-guide',
    title: 'Field Workforce Tracking: What It Is and How to Get It Right',
    description:
      'A guide to tracking field employees with GPS location and geofenced check-ins without destroying trust or privacy.',
    date: '2026-06-25',
    readTime: '6 min read',
    category: 'Attendance',
    sections: [
      {
        heading: 'Field teams need different attendance rules',
        paragraphs: [
          'A service engineer, sales representative, or installation crew cannot check in from an office, so the office attendance policy does not apply to them. Field workforce tracking solves this by letting employees check in from the field using their GPS location, and letting managers see where their team is during the workday.',
        ],
      },
      {
        heading: 'The two core features: geofencing and live tracking',
        paragraphs: [
          'Geofencing verifies that a check-in happens within an approved work area, such as a client site or a territory. Live tracking records location at regular intervals while the employee is checked in, which powers route visibility and location history on a live map.',
          'Get the balance right: geofencing for verification, live tracking for visibility. Employees should never feel the company is watching them outside working hours.',
        ],
      },
      {
        heading: 'Set clear boundaries on location data',
        paragraphs: [
          'Location tracking is sensitive, and a responsible policy protects both the company and the employee. Define exactly when location is collected (only during checked-in sessions), who can view it (authorized HR and managers), and how long history is retained. Employees should be able to deny permission through their device settings, with the consequence clearly documented: geofenced check-in will not work.',
        ],
      },
      {
        heading: 'Track outcomes, not just movement',
        paragraphs: [
          'The data from field tracking is most valuable when it is tied to outcomes: visits completed, tasks closed, and time on site. Managers should use location history to coach route efficiency and workload distribution, not to police minutes. Teams that use tracking for planning see buy-in; teams that use it for surveillance see attrition.',
        ],
      },
    ],
  },
  {
    slug: 'leave-management-checklist-hr',
    title: 'Leave Management: A Checklist for HR Teams That Actually Works',
    description:
      'How to build a leave policy and a leave management process that keeps balances accurate, approvals fast, and audits painless.',
    date: '2026-06-05',
    readTime: '5 min read',
    category: 'Leave',
    sections: [
      {
        heading: 'Start from a policy employees can read in two minutes',
        paragraphs: [
          'The best leave policies are short, structured, and unambiguous. State the leave types you offer, how many days each provides, how accruals work, and the minimum notice for each type. Publish it in one place and link it from the employee handbook.',
        ],
        list: [
          'Annual leave and how it accrues (per month, per quarter, or upfront).',
          'Casual, sick, and privilege leave definitions — and whether they carry over.',
          'Unpaid leave and its impact on other balances.',
          'Public holidays and how they interact with leave requests.',
        ],
      },
      {
        heading: 'Automate balances so nobody computes them by hand',
        paragraphs: [
          'Manually maintained leave trackers are where errors start. Accruals, carry-over, and adjustments should be computed by the system from policy rules, so the balance an employee sees is the same one finance uses at year-end. Automation also prevents the classic disputes: "I had 5 days left" versus "the record says 2".',
        ],
      },
      {
        heading: 'Design an approval flow with deadlines',
        paragraphs: [
          'Requests that sit unanswered create frustration and last-minute approvals. Define the approval chain per leave type (manager, then HR for longer leaves) and add a response deadline. If a manager does not act in time, the request should escalate automatically instead of waiting silently.',
        ],
      },
      {
        heading: 'Review leave data quarterly',
        paragraphs: [
          'Leave data reveals patterns worth acting on: teams with high sick-leave usage, individuals who never take leave, or approval bottlenecks. A short quarterly review of utilization and approval times keeps the process healthy and catches problems before they become HR issues.',
        ],
      },
    ],
  },
];

export function getBlogArticle(slug: string): BlogArticle | undefined {
  return blogArticles.find((article) => article.slug === slug);
}
