
// Mock data for request and approvals
export const mockRequests = [
  {
    id: "REQ-2025-001",
    employeeName: "John Doe",
    employeeId: "EMP-001",
    department: "Engineering",
    type: "WFH",
    requestDate: "2025-04-01",
    requestedFor: {
      from: "2025-04-05",
      to: "2025-04-07"
    },
    reason: "Working on a critical project that requires focused attention without interruptions",
    status: "Pending",
    attachment: null,
    history: [
      {
        action: "Request Submitted",
        date: "2025-04-01 09:15 AM",
        by: "John Doe (EMP-001)",
        remarks: null
      }
    ]
  },
  {
    id: "REQ-2025-002",
    employeeName: "Jane Smith",
    employeeId: "EMP-002",
    department: "Marketing",
    type: "Shift Change",
    requestDate: "2025-04-02",
    requestedFor: {
      from: "2025-04-10",
      to: null
    },
    reason: "Need to attend a doctor's appointment in the morning",
    status: "Approved",
    attachment: null,
    history: [
      {
        action: "Request Submitted",
        date: "2025-04-02 10:30 AM",
        by: "Jane Smith (EMP-002)",
        remarks: null
      },
      {
        action: "Request Approved",
        date: "2025-04-02 02:15 PM",
        by: "Michael Brown (Manager)",
        remarks: "Approved as per company policy"
      }
    ]
  },
  {
    id: "REQ-2025-003",
    employeeName: "Michael Johnson",
    employeeId: "EMP-003",
    department: "Finance",
    type: "OD",
    requestDate: "2025-04-03",
    requestedFor: {
      from: "2025-04-12",
      to: "2025-04-13"
    },
    reason: "Client meeting in Boston office",
    status: "Approved",
    attachment: "travel_itinerary.pdf",
    history: [
      {
        action: "Request Submitted",
        date: "2025-04-03 11:45 AM",
        by: "Michael Johnson (EMP-003)",
        remarks: null
      },
      {
        action: "Request Approved",
        date: "2025-04-03 04:30 PM",
        by: "Sarah Wilson (HR Manager)",
        remarks: "Approved with travel expenses"
      }
    ]
  },
  {
    id: "REQ-2025-004",
    employeeName: "Emily Davis",
    employeeId: "EMP-004",
    department: "HR",
    type: "WFH",
    requestDate: "2025-04-03",
    requestedFor: {
      from: "2025-04-15",
      to: "2025-04-16"
    },
    reason: "Internet installation at home",
    status: "Rejected",
    attachment: null,
    history: [
      {
        action: "Request Submitted",
        date: "2025-04-03 03:20 PM",
        by: "Emily Davis (EMP-004)",
        remarks: null
      },
      {
        action: "Request Rejected",
        date: "2025-04-04 09:45 AM",
        by: "Sarah Wilson (HR Manager)",
        remarks: "Not aligned with department schedule"
      }
    ]
  },
  {
    id: "REQ-2025-005",
    employeeName: "David Wilson",
    employeeId: "EMP-005",
    department: "Engineering",
    type: "Attendance Regularization",
    requestDate: "2025-04-04",
    requestedFor: {
      from: "2025-04-03",
      to: null
    },
    reason: "Forgot to punch in, arrived at 9:00 AM",
    status: "Pending",
    attachment: null,
    history: [
      {
        action: "Request Submitted",
        date: "2025-04-04 08:30 AM",
        by: "David Wilson (EMP-005)",
        remarks: null
      }
    ]
  },
  {
    id: "REQ-2025-006",
    employeeName: "Sarah Brown",
    employeeId: "EMP-006",
    department: "Marketing",
    type: "Late Arrival",
    requestDate: "2025-04-04",
    requestedFor: {
      from: "2025-04-05",
      to: null
    },
    reason: "Traffic due to road construction",
    status: "Pending",
    attachment: null,
    history: [
      {
        action: "Request Submitted",
        date: "2025-04-04 09:15 AM",
        by: "Sarah Brown (EMP-006)",
        remarks: null
      }
    ]
  },
  {
    id: "REQ-2025-007",
    employeeName: "Robert Miller",
    employeeId: "EMP-007",
    department: "Finance",
    type: "WFH",
    requestDate: "2025-04-05",
    requestedFor: {
      from: "2025-04-08",
      to: "2025-04-09"
    },
    reason: "Plumbing work at home",
    status: "Approved",
    attachment: "plumber_appointment.pdf",
    history: [
      {
        action: "Request Submitted",
        date: "2025-04-05 11:30 AM",
        by: "Robert Miller (EMP-007)",
        remarks: null
      },
      {
        action: "Request Approved",
        date: "2025-04-05 03:45 PM",
        by: "Michael Johnson (Manager)",
        remarks: "Approved as per policy"
      }
    ]
  },
  {
    id: "REQ-2025-008",
    employeeName: "Jennifer Taylor",
    employeeId: "EMP-008",
    department: "Engineering",
    type: "Shift Change",
    requestDate: "2025-04-05",
    requestedFor: {
      from: "2025-04-10",
      to: null
    },
    reason: "Personal emergency",
    status: "Pending",
    attachment: null,
    history: [
      {
        action: "Request Submitted",
        date: "2025-04-05 02:15 PM",
        by: "Jennifer Taylor (EMP-008)",
        remarks: null
      }
    ]
  },
  {
    id: "REQ-2025-009",
    employeeName: "William Anderson",
    employeeId: "EMP-009",
    department: "HR",
    type: "OD",
    requestDate: "2025-04-06",
    requestedFor: {
      from: "2025-04-15",
      to: "2025-04-17"
    },
    reason: "HR Conference in New York",
    status: "Approved",
    attachment: "conference_details.pdf",
    history: [
      {
        action: "Request Submitted",
        date: "2025-04-06 09:45 AM",
        by: "William Anderson (EMP-009)",
        remarks: null
      },
      {
        action: "Request Approved",
        date: "2025-04-06 11:30 AM",
        by: "Sarah Wilson (HR Manager)",
        remarks: "Approved with travel expenses"
      }
    ]
  },
  {
    id: "REQ-2025-010",
    employeeName: "Elizabeth Thomas",
    employeeId: "EMP-010",
    department: "Marketing",
    type: "Attendance Regularization",
    requestDate: "2025-04-06",
    requestedFor: {
      from: "2025-04-05",
      to: null
    },
    reason: "System was down, couldn't log attendance",
    status: "Rejected",
    attachment: null,
    history: [
      {
        action: "Request Submitted",
        date: "2025-04-06 10:15 AM",
        by: "Elizabeth Thomas (EMP-010)",
        remarks: null
      },
      {
        action: "Request Rejected",
        date: "2025-04-06 03:20 PM",
        by: "Michael Brown (Manager)",
        remarks: "System was working fine according to IT logs"
      }
    ]
  },
  {
    id: "REQ-2025-011",
    employeeName: "Richard Clark",
    employeeId: "EMP-011",
    department: "Engineering",
    type: "WFH",
    requestDate: "2025-04-07",
    requestedFor: {
      from: "2025-04-09",
      to: "2025-04-11"
    },
    reason: "Need to focus on critical project deadline",
    status: "Pending",
    attachment: null,
    history: [
      {
        action: "Request Submitted",
        date: "2025-04-07 09:30 AM",
        by: "Richard Clark (EMP-011)",
        remarks: null
      }
    ]
  },
  {
    id: "REQ-2025-012",
    employeeName: "Patricia Lewis",
    employeeId: "EMP-012",
    department: "Finance",
    type: "Late Arrival",
    requestDate: "2025-04-07",
    requestedFor: {
      from: "2025-04-08",
      to: null
    },
    reason: "Car broke down on the way",
    status: "Pending",
    attachment: "car_repair_receipt.pdf",
    history: [
      {
        action: "Request Submitted",
        date: "2025-04-07 10:45 AM",
        by: "Patricia Lewis (EMP-012)",
        remarks: null
      }
    ]
  }
];
