'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { UserRole } from '@/lib/types';

interface FAQSectionProps {
  searchQuery: string;
  userRole: UserRole;
}

const faqs = [
  {
    category: 'Attendance',
    questions: [
      {
        question: 'What if I forget to check in?',
        answer:
          'If you forget to check in, contact your supervisor or HR. They can manually mark your attendance. However, it\'s best to check in on time to maintain accurate records.',
        roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR],
      },
      {
        question: 'How is late arrival calculated?',
        answer:
          'Late arrival is calculated based on your organization\'s working hours. If you check in after the configured start time, you will be marked as late. The exact time is set by your administrator in Settings.',
        roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR],
      },
      {
        question: 'Can I check in from home?',
        answer:
          'Yes, you can check in from anywhere as long as you have internet access and a camera. The system uses your device camera to capture your photo for verification.',
        roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR],
      },
      {
        question: 'What happens if my camera is not working?',
        answer:
          'If your camera is not working, contact your IT support or HR. They can help troubleshoot the issue or provide an alternative method for marking attendance.',
        roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR],
      },
    ],
  },
  {
    category: 'Leave',
    questions: [
      {
        question: 'How do I request leave?',
        answer:
          'Navigate to "My Leave" from the sidebar, click "Request Leave", fill in the details (leave type, dates, reason), and submit. Your supervisor or HR will review and approve/reject your request.',
        roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR],
      },
      {
        question: 'When are leave balances reset?',
        answer:
          'Leave balances are reset at the start of each fiscal year. The fiscal year start month is configured by your administrator in Settings. You\'ll receive your annual allocation at that time.',
        roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR],
      },
      {
        question: 'Can I cancel a leave request?',
        answer:
          'Yes, you can cancel a leave request if it\'s still pending approval. Once approved or rejected, you cannot cancel it. Go to "My Leave" and click cancel on the pending request.',
        roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR],
      },
      {
        question: 'What is the difference between leave types?',
        answer:
          'Sick Leave: For medical reasons. Casual Leave: For personal reasons. Vacation Leave: For planned vacations. Unpaid Leave: No balance deduction, can be requested anytime.',
        roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR],
      },
      {
        question: 'How do I approve or reject leave requests?',
        answer:
          'Go to "Leave Approvals" from the sidebar, view pending requests, click on a request to see details, and click "Approve" or "Reject". You can add notes explaining your decision.',
        roles: [UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN],
      },
    ],
  },
  {
    category: 'Technical',
    questions: [
      {
        question: 'How do I change my password?',
        answer:
          'Go to "Profile" from the sidebar, scroll to the "Change Password" section, enter your current password and new password, then click "Update Password".',
        roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN],
      },
      {
        question: 'Why can\'t I see my attendance records?',
        answer:
          'Make sure you\'re logged in with the correct account. If you still can\'t see records, contact your HR or administrator. They may need to verify your account settings.',
        roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR],
      },
      {
        question: 'What browsers are supported?',
        answer:
          'TrizenHR works best on Chrome, Firefox, Safari, and Edge (latest versions). Make sure your browser is up to date for the best experience.',
        roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN],
      },
      {
        question: 'Can I use TrizenHR on mobile?',
        answer:
          'Yes, TrizenHR is fully responsive and works on mobile devices. You can access all features including check-in, leave requests, and viewing reports from your mobile browser.',
        roles: [UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.HR, UserRole.ADMIN],
      },
    ],
  },
  {
    category: 'Reports',
    questions: [
      {
        question: 'How do I generate attendance reports?',
        answer:
          'Go to "Reports" → "Attendance Reports" tab, apply filters (date range, department, status), and click "Export CSV" to download the report.',
        roles: [UserRole.HR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      },
      {
        question: 'Can I export reports in different formats?',
        answer:
          'Currently, reports can be exported as CSV files. CSV files can be opened in Excel, Google Sheets, or any spreadsheet application for further analysis.',
        roles: [UserRole.HR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      },
      {
        question: 'What information is included in reports?',
        answer:
          'Attendance reports include: date, employee name, employee ID, department, check-in time, check-out time, status, and working hours. Leave reports include: employee details, leave type, dates, days, status, and reason.',
        roles: [UserRole.HR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      },
    ],
  },
];

export default function FAQSection({ searchQuery, userRole }: FAQSectionProps) {
  // Filter FAQs based on role and search query
  const filteredFAQs = faqs.map((category) => ({
    ...category,
    questions: category.questions.filter((faq) => {
      const roleMatch = faq.roles.includes(userRole);
      const searchMatch =
        !searchQuery ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return roleMatch && searchMatch;
    }),
  })).filter((category) => category.questions.length > 0);

  if (filteredFAQs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {searchQuery
          ? `No FAQs found for "${searchQuery}"`
          : 'No FAQs available for your role'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredFAQs.map((category) => (
        <Card key={category.category}>
          <CardHeader>
            <CardTitle>{category.category} FAQs</CardTitle>
            <CardDescription>
              Common questions about {category.category.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {category.questions.map((faq, index) => {
                const itemValue = `${category.category}-${index}`;
                return (
                  <AccordionItem key={index} value={itemValue}>
                    <AccordionTrigger className="text-left" value={itemValue}>
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground" value={itemValue}>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
