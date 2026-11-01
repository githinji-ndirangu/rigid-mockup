/* =========================================================
   Rigid Group — mock data
   Plain global constants, loaded with a classic <script> tag.
   All people, clients, vehicles and identifiers are fictional.
   Dates are relative to October 2026.
   ========================================================= */

/* -----------------------------
   Current user
   ----------------------------- */
const currentUser = {
  name: "Rose Kahiga",
  email: "rose@rigidgroup.co.ke",
  role: "Owner"
};

/* -----------------------------
   Clients — 8
   ----------------------------- */
const clients = [
  {
    id: "CL-001",
    name: "Summit Bank Kenya",
    type: "Bank",
    phone: "+254 712 345 678",
    email: "asset.recovery@summitbank.co.ke"
  },
  {
    id: "CL-002",
    name: "Imara Microfinance",
    type: "Microfinance",
    phone: "+254 733 902 114",
    email: "recoveries@imaramicro.co.ke"
  },
  {
    id: "CL-003",
    name: "Mwangi & Co. Advocates",
    type: "Law Firm",
    phone: "+254 720 556 331",
    email: "cases@mwangi-advocates.co.ke"
  },
  {
    id: "CL-004",
    name: "Baraka Credit Union",
    type: "Microfinance",
    phone: "+254 701 884 220",
    email: "credit@barakacu.co.ke"
  },
  {
    id: "CL-005",
    name: "Rift Valley Bank",
    type: "Bank",
    phone: "+254 711 630 905",
    email: "repossession@riftvalleybank.co.ke"
  },
  {
    id: "CL-006",
    name: "Kipepeo Finance",
    type: "Microfinance",
    phone: "+254 722 417 863",
    email: "collections@kipepeofinance.co.ke"
  },
  {
    id: "CL-007",
    name: "Ochieng & Partners",
    type: "Law Firm",
    phone: "+254 734 208 551",
    email: "legal@ochiengpartners.co.ke"
  },
  {
    id: "CL-008",
    name: "Peter Kimani",
    type: "Individual",
    phone: "+254 700 195 442",
    email: "p.kimani@example.co.ke"
  }
];

/* -----------------------------
   Cases — 20
   Stages: Instruction → Proclamation → Repossessed →
           Advertised → Auctioned → Closed
   ----------------------------- */
const cases = [
  {
    id: "RA-2026-0101",
    clientId: "CL-001",
    debtorName: "Joseph Mutiso Kilonzo",
    debtorPhone: "+254 722 418 903",
    hasCourtOrder: true,
    loanRef: "SBK/AUTO/2024/1187",
    amountOwed: 1840000,
    stage: "Closed",
    instructionDate: "2026-07-06",
    proclamationDate: "2026-07-13",
    repossessionDate: "2026-07-21",
    advertDate: "2026-08-03",
    auctionDate: "2026-08-18",
    closedReason: "Sold"
  },
  {
    id: "RA-2026-0102",
    clientId: "CL-002",
    debtorName: "Mary Achieng' Ouma",
    debtorPhone: "+254 711 602 447",
    hasCourtOrder: true,
    loanRef: "IMF/PL/2023/0942",
    amountOwed: 1215000,
    stage: "Closed",
    instructionDate: "2026-07-20",
    proclamationDate: "2026-07-27",
    repossessionDate: "2026-08-04",
    advertDate: null,
    auctionDate: null,
    closedReason: "Debtor paid"
  },
  {
    id: "RA-2026-0103",
    clientId: "CL-005",
    debtorName: "Samuel Kiprono Bett",
    debtorPhone: "+254 733 221 804",
    hasCourtOrder: true,
    loanRef: "RVB/ASSET/2025/0211",
    amountOwed: 2960000,
    stage: "Auctioned",
    instructionDate: "2026-08-03",
    proclamationDate: "2026-08-10",
    repossessionDate: "2026-09-02",
    advertDate: "2026-10-05",
    auctionDate: "2026-10-22"
  },
  {
    id: "RA-2026-0104",
    clientId: "CL-003",
    debtorName: "Fatuma Hassan Ali",
    debtorPhone: "+254 720 338 612",
    hasCourtOrder: true,
    loanRef: "MCA/2025/0457",
    amountOwed: 1430000,
    stage: "Auctioned",
    instructionDate: "2026-08-12",
    proclamationDate: "2026-08-19",
    repossessionDate: "2026-09-15",
    advertDate: "2026-10-08",
    auctionDate: "2026-10-27"
  },
  {
    id: "RA-2026-0105",
    clientId: "CL-001",
    debtorName: "Daniel Omondi Were",
    debtorPhone: "+254 701 774 205",
    hasCourtOrder: true,
    loanRef: "SBK/AUTO/2025/0674",
    amountOwed: 2780000,
    stage: "Auctioned",
    instructionDate: "2026-08-24",
    proclamationDate: "2026-08-31",
    repossessionDate: "2026-09-28",
    advertDate: "2026-10-12",
    auctionDate: "2026-10-29"
  },
  {
    id: "RA-2026-0106",
    clientId: "CL-004",
    debtorName: "Grace Njeri Kamau",
    debtorPhone: "+254 712 099 356",
    hasCourtOrder: false,
    loanRef: "BCU/LN/2025/1180",
    amountOwed: 2150000,
    stage: "Advertised",
    instructionDate: "2026-09-01",
    proclamationDate: "2026-09-08",
    repossessionDate: "2026-10-05",
    advertDate: "2026-10-19",
    auctionDate: "2026-11-05"
  },
  {
    id: "RA-2026-0107",
    clientId: "CL-002",
    debtorName: "Peter Mwangi Githinji",
    debtorPhone: "+254 733 540 118",
    hasCourtOrder: true,
    loanRef: "IMF/PL/2024/1533",
    amountOwed: 3420000,
    stage: "Advertised",
    instructionDate: "2026-09-04",
    proclamationDate: "2026-09-11",
    repossessionDate: "2026-10-08",
    advertDate: "2026-10-21",
    auctionDate: "2026-11-10"
  },
  {
    id: "RA-2026-0108",
    clientId: "CL-005",
    debtorName: "Amina Yusuf Noor",
    debtorPhone: "+254 721 886 903",
    hasCourtOrder: true,
    loanRef: "RVB/ASSET/2025/0308",
    amountOwed: 2640000,
    stage: "Advertised",
    instructionDate: "2026-09-08",
    proclamationDate: "2026-09-15",
    repossessionDate: "2026-10-12",
    advertDate: "2026-10-23",
    auctionDate: "2026-11-12"
  },
  {
    id: "RA-2026-0109",
    clientId: "CL-006",
    debtorName: "Charles Otieno Odhiambo",
    debtorPhone: "+254 700 341 779",
    hasCourtOrder: false,
    loanRef: "KPF/2025/0721",
    amountOwed: 1950000,
    stage: "Advertised",
    instructionDate: "2026-09-11",
    proclamationDate: "2026-09-18",
    repossessionDate: "2026-10-15",
    advertDate: "2026-10-26",
    auctionDate: "2026-11-17"
  },
  {
    id: "RA-2026-0110",
    clientId: "CL-003",
    debtorName: "Rehema Wanjiku Maina",
    debtorPhone: "+254 722 605 483",
    hasCourtOrder: true,
    loanRef: "MCA/2026/0089",
    amountOwed: 2310000,
    stage: "Repossessed",
    instructionDate: "2026-09-16",
    proclamationDate: "2026-09-23",
    repossessionDate: "2026-10-19",
    advertDate: null,
    auctionDate: null
  },
  {
    id: "RA-2026-0111",
    clientId: "CL-004",
    debtorName: "Brian Kiptoo Cheruiyot",
    debtorPhone: "+254 711 248 650",
    hasCourtOrder: true,
    loanRef: "BCU/LN/2026/0142",
    amountOwed: 7850000,
    stage: "Repossessed",
    instructionDate: "2026-09-18",
    proclamationDate: "2026-09-25",
    repossessionDate: "2026-10-21",
    advertDate: null,
    auctionDate: null
  },
  {
    id: "RA-2026-0112",
    clientId: "CL-001",
    debtorName: "Lucy Wairimu Njenga",
    debtorPhone: "+254 733 917 402",
    hasCourtOrder: true,
    loanRef: "SBK/AUTO/2026/0233",
    amountOwed: 3100000,
    stage: "Repossessed",
    instructionDate: "2026-09-22",
    proclamationDate: "2026-09-29",
    repossessionDate: "2026-10-23",
    advertDate: null,
    auctionDate: null
  },
  {
    id: "RA-2026-0113",
    clientId: "CL-006",
    debtorName: "Ahmed Ibrahim Farah",
    debtorPhone: "+254 720 773 195",
    hasCourtOrder: false,
    loanRef: "KPF/2026/0310",
    amountOwed: 2480000,
    stage: "Repossessed",
    instructionDate: "2026-09-28",
    proclamationDate: "2026-10-05",
    repossessionDate: "2026-10-28",
    advertDate: null,
    auctionDate: null
  },
  {
    id: "RA-2026-0114",
    clientId: "CL-002",
    debtorName: "Jane Wanjiru Kariuki",
    debtorPhone: "+254 712 660 528",
    hasCourtOrder: true,
    loanRef: "IMF/PL/2026/0401",
    amountOwed: 1760000,
    stage: "Proclamation",
    instructionDate: "2026-10-16",
    proclamationDate: "2026-10-24",
    repossessionDate: null,
    advertDate: null,
    auctionDate: null
  },
  {
    id: "RA-2026-0115",
    clientId: "CL-005",
    debtorName: "Michael Oduor Ong'ondo",
    debtorPhone: "+254 733 410 276",
    hasCourtOrder: true,
    loanRef: "RVB/ASSET/2026/0418",
    amountOwed: 2990000,
    stage: "Proclamation",
    instructionDate: "2026-10-19",
    proclamationDate: "2026-10-25",
    repossessionDate: null,
    advertDate: null,
    auctionDate: null
  },
  {
    id: "RA-2026-0116",
    clientId: "CL-003",
    debtorName: "Esther Nyambura Kimani",
    debtorPhone: "+254 701 338 942",
    hasCourtOrder: true,
    loanRef: "MCA/2026/0164",
    amountOwed: 1380000,
    stage: "Proclamation",
    instructionDate: "2026-10-21",
    proclamationDate: "2026-10-26",
    repossessionDate: null,
    advertDate: null,
    auctionDate: null
  },
  {
    id: "RA-2026-0117",
    clientId: "CL-004",
    debtorName: "David Kiplagat Rono",
    debtorPhone: "+254 721 500 873",
    hasCourtOrder: false,
    loanRef: "BCU/LN/2026/0499",
    amountOwed: 2220000,
    stage: "Proclamation",
    instructionDate: "2026-10-23",
    proclamationDate: "2026-10-29",
    repossessionDate: null,
    advertDate: null,
    auctionDate: null
  },
  {
    id: "RA-2026-0118",
    clientId: "CL-001",
    debtorName: "Susan Atieno Ochieng",
    debtorPhone: "+254 711 229 640",
    hasCourtOrder: true,
    loanRef: "SBK/AUTO/2026/0521",
    amountOwed: 1620000,
    stage: "Instruction",
    instructionDate: "2026-10-27",
    proclamationDate: null,
    repossessionDate: null,
    advertDate: null,
    auctionDate: null
  },
  {
    id: "RA-2026-0119",
    clientId: "CL-006",
    debtorName: "James Muthoka Musyoka",
    debtorPhone: "+254 733 844 107",
    hasCourtOrder: false,
    loanRef: "KPF/2026/0556",
    amountOwed: 1240000,
    stage: "Instruction",
    instructionDate: "2026-10-28",
    proclamationDate: null,
    repossessionDate: null,
    advertDate: null,
    auctionDate: null
  },
  {
    id: "RA-2026-0120",
    clientId: "CL-002",
    debtorName: "Lydia Chebet Kirui",
    debtorPhone: "+254 720 610 394",
    hasCourtOrder: true,
    loanRef: "IMF/PL/2026/0588",
    amountOwed: 2880000,
    stage: "Instruction",
    instructionDate: "2026-10-30",
    proclamationDate: null,
    repossessionDate: null,
    advertDate: null,
    auctionDate: null
  }
];

/* -----------------------------
   Vehicles — 14
   Linked to cases that are Repossessed or later.
   ----------------------------- */
const vehicles = [
  {
    id: "V-1001",
    caseId: "RA-2026-0101",
    make: "Mara",
    model: "Terra 4x4",
    year: 2018,
    plate: "KDD 282J",
    chassisNo: "MRAFR22G8J0124587",
    colour: "White",
    mileage: 128400,
    condition: "Good",
    yardLocation: "Yard A - Bay 3",
    dateIn: "2026-07-21",
    dailyStorageFee: 1500,
    reservePrice: 1850000,
    auctionDate: "2026-08-18",
    sellingPrice: 1920000,
    soldDate: "2026-08-18",
    buyerName: "Naliaka Holdings",
    status: "Sold"
  },
  {
    id: "V-1002",
    caseId: "RA-2026-0102",
    make: "Rift",
    model: "Hauler DC",
    year: 2017,
    plate: "KCA 441M",
    chassisNo: "RFTDC17A4H0338120",
    colour: "Silver",
    mileage: 142000,
    condition: "Fair",
    yardLocation: "Yard B - Bay 1",
    dateIn: "2026-08-04",
    dailyStorageFee: 1200,
    reservePrice: 1450000,
    auctionDate: null,
    sellingPrice: null,
    releasedDate: "2026-08-12",
    status: "Released"
  },
  {
    id: "V-1003",
    caseId: "RA-2026-0103",
    make: "Tembo",
    model: "Trail SUV",
    year: 2019,
    plate: "KDJ 905Q",
    chassisNo: "TMBTR19K5K0447291",
    colour: "Pearl White",
    mileage: 96300,
    condition: "Excellent",
    yardLocation: "Yard A - Bay 1",
    dateIn: "2026-09-02",
    dailyStorageFee: 2000,
    reservePrice: 4800000,
    auctionDate: "2026-10-22",
    sellingPrice: 5050000,
    soldDate: "2026-10-22",
    buyerName: "Chebet Transport Ltd",
    status: "Sold"
  },
  {
    id: "V-1004",
    caseId: "RA-2026-0104",
    make: "Kifaru",
    model: "Ridge LX",
    year: 2020,
    plate: "KDH 118T",
    chassisNo: "KFRRG20L2L0551043",
    colour: "Grey",
    mileage: 88700,
    condition: "Good",
    yardLocation: "Yard C - Bay 2",
    dateIn: "2026-09-15",
    dailyStorageFee: 1500,
    reservePrice: 2350000,
    auctionDate: "2026-10-27",
    sellingPrice: 2410000,
    soldDate: "2026-10-27",
    buyerName: "Oduor Auto Traders",
    status: "Sold"
  },
  {
    id: "V-1005",
    caseId: "RA-2026-0105",
    make: "Nuru",
    model: "Metro C",
    year: 2018,
    plate: "KCF 772L",
    chassisNo: "NRUMC18C7J0662385",
    colour: "Red",
    mileage: 74500,
    condition: "Good",
    yardLocation: "Yard B - Bay 4",
    dateIn: "2026-09-28",
    dailyStorageFee: 1300,
    reservePrice: 1750000,
    auctionDate: "2026-10-29",
    sellingPrice: 1780000,
    soldDate: "2026-10-29",
    buyerName: "Kiptoo Investments",
    status: "Sold"
  },
  {
    id: "V-1006",
    caseId: "RA-2026-0106",
    make: "Savannah",
    model: "Voyager",
    year: 2017,
    plate: "KDB 334P",
    chassisNo: "SVNVY17G1H0779114",
    colour: "Blue",
    mileage: 109200,
    condition: "Fair",
    yardLocation: "Yard A - Bay 5",
    dateIn: "2026-10-05",
    dailyStorageFee: 1300,
    reservePrice: 1550000,
    auctionDate: "2026-11-05",
    sellingPrice: null,
    status: "Advertised"
  },
  {
    id: "V-1007",
    caseId: "RA-2026-0107",
    make: "Tembo",
    model: "Trail XT",
    year: 2019,
    plate: "KDL 660R",
    chassisNo: "TMBTX19K8K0884420",
    colour: "Black",
    mileage: 68900,
    condition: "Excellent",
    yardLocation: "Yard C - Bay 1",
    dateIn: "2026-10-08",
    dailyStorageFee: 1800,
    reservePrice: 3200000,
    auctionDate: "2026-11-10",
    sellingPrice: null,
    status: "Advertised"
  },
  {
    id: "V-1008",
    caseId: "RA-2026-0108",
    make: "Nuru",
    model: "Metro C",
    year: 2018,
    plate: "KCX 883N",
    chassisNo: "NRUMC18C9J0991576",
    colour: "White",
    mileage: 82400,
    condition: "Good",
    yardLocation: "Yard B - Bay 2",
    dateIn: "2026-10-12",
    dailyStorageFee: 1300,
    reservePrice: 2100000,
    auctionDate: "2026-11-12",
    sellingPrice: null,
    status: "Advertised"
  },
  {
    id: "V-1009",
    caseId: "RA-2026-0109",
    make: "Rift",
    model: "Hauler SC",
    year: 2016,
    plate: "KCM 219K",
    chassisNo: "RFTHS16B3G1002845",
    colour: "Grey",
    mileage: 156800,
    condition: "Fair",
    yardLocation: "Yard C - Bay 4",
    dateIn: "2026-10-15",
    dailyStorageFee: 1400,
    reservePrice: 1300000,
    auctionDate: "2026-11-17",
    sellingPrice: null,
    status: "Advertised"
  },
  {
    id: "V-1010",
    caseId: "RA-2026-0110",
    make: "Kifaru",
    model: "Ridge LX",
    year: 2017,
    plate: "KDA 507S",
    chassisNo: "KFRRG17D5H1117630",
    colour: "Silver",
    mileage: 131600,
    condition: "Good",
    yardLocation: "Yard A - Bay 2",
    dateIn: "2026-10-19",
    dailyStorageFee: 1600,
    reservePrice: 2450000,
    auctionDate: null,
    sellingPrice: null,
    status: "In Yard"
  },
  {
    id: "V-1011",
    caseId: "RA-2026-0111",
    make: "Mara",
    model: "Summit 300",
    year: 2019,
    plate: "KDN 447U",
    chassisNo: "MRASM19M4K1229087",
    colour: "White",
    mileage: 71200,
    condition: "Excellent",
    yardLocation: "Yard A - Bay 4",
    dateIn: "2026-10-21",
    dailyStorageFee: 2500,
    reservePrice: 7200000,
    auctionDate: null,
    sellingPrice: null,
    status: "In Yard"
  },
  {
    id: "V-1012",
    caseId: "RA-2026-0111",
    make: "Kazi",
    model: "City Hatch",
    year: 2017,
    plate: "KCS 920A",
    chassisNo: "KZCCH17E2H1337705",
    colour: "Silver",
    mileage: 94700,
    condition: "Fair",
    yardLocation: "Yard B - Bay 3",
    dateIn: "2026-10-21",
    dailyStorageFee: 1000,
    reservePrice: 780000,
    auctionDate: null,
    sellingPrice: null,
    status: "In Yard"
  },
  {
    id: "V-1013",
    caseId: "RA-2026-0112",
    make: "Nuru",
    model: "Executive 200",
    year: 2018,
    plate: "KDJ 156V",
    chassisNo: "NRUEX18F6J1443321",
    colour: "Black",
    mileage: 63800,
    condition: "Good",
    yardLocation: "Yard C - Bay 3",
    dateIn: "2026-10-23",
    dailyStorageFee: 1800,
    reservePrice: 2900000,
    auctionDate: null,
    sellingPrice: null,
    status: "In Yard"
  },
  {
    id: "V-1014",
    caseId: "RA-2026-0113",
    make: "Savannah",
    model: "Voyager",
    year: 2019,
    plate: "KCY 604B",
    chassisNo: "SVNVY19H9K1556188",
    colour: "Dark Blue",
    mileage: 79500,
    condition: "Good",
    yardLocation: "Yard A - Bay 6",
    dateIn: "2026-10-28",
    dailyStorageFee: 1400,
    reservePrice: 2250000,
    auctionDate: null,
    sellingPrice: null,
    status: "In Yard"
  }
];

/* -----------------------------
   Invoices — 15
   ----------------------------- */
const invoices = [
  {
    id: "INV-2026-041",
    caseId: "RA-2026-0102",
    type: "Proclamation - Debtor",
    amount: 35000,
    status: "Paid",
    issueDate: "2026-08-06",
    dueDate: "2026-08-20"
  },
  {
    id: "INV-2026-042",
    caseId: "RA-2026-0101",
    type: "Auction - Debtor",
    amount: 85000,
    status: "Paid",
    issueDate: "2026-08-19",
    dueDate: "2026-09-02"
  },
  {
    id: "INV-2026-043",
    caseId: "RA-2026-0105",
    type: "Auction - Debtor",
    amount: 92500,
    status: "Sent",
    issueDate: "2026-10-29",
    dueDate: "2026-11-12"
  },
  {
    id: "INV-2026-044",
    caseId: "RA-2026-0104",
    type: "Auction - Debtor",
    amount: 88000,
    status: "Sent",
    issueDate: "2026-10-27",
    dueDate: "2026-11-10"
  },
  {
    id: "INV-2026-045",
    caseId: "RA-2026-0103",
    type: "Auction - Debtor",
    amount: 96000,
    status: "Sent",
    issueDate: "2026-10-22",
    dueDate: "2026-11-05"
  },
  {
    id: "INV-2026-046",
    caseId: "RA-2026-0114",
    type: "Proclamation - Debtor",
    amount: 28000,
    status: "Sent",
    issueDate: "2026-10-24",
    dueDate: "2026-11-07"
  },
  {
    id: "INV-2026-047",
    caseId: "RA-2026-0106",
    type: "Proclamation - Debtor",
    amount: 30000,
    status: "Overdue",
    issueDate: "2026-09-18",
    dueDate: "2026-10-02"
  },
  {
    id: "INV-2026-048",
    caseId: "RA-2026-0107",
    type: "Proclamation - Debtor",
    amount: 32000,
    status: "Overdue",
    issueDate: "2026-09-22",
    dueDate: "2026-10-06"
  },
  {
    id: "INV-2026-049",
    caseId: "RA-2026-0110",
    type: "Proclamation - Debtor",
    amount: 30000,
    status: "Paid",
    issueDate: "2026-10-03",
    dueDate: "2026-10-17"
  },
  {
    id: "INV-2026-050",
    caseId: "RA-2026-0111",
    type: "Proclamation - Debtor",
    amount: 45000,
    status: "Sent",
    issueDate: "2026-10-21",
    dueDate: "2026-11-04"
  },
  {
    id: "INV-2026-051",
    caseId: "RA-2026-0112",
    type: "Proclamation - Debtor",
    amount: 30000,
    status: "Draft",
    issueDate: "2026-10-29",
    dueDate: "2026-11-12"
  },
  {
    id: "INV-2026-052",
    caseId: "RA-2026-0106",
    type: "Client Statement",
    amount: 145000,
    status: "Overdue",
    issueDate: "2026-09-30",
    dueDate: "2026-10-14"
  },
  {
    id: "INV-2026-053",
    caseId: "RA-2026-0108",
    type: "Client Statement",
    amount: 210000,
    status: "Sent",
    issueDate: "2026-10-20",
    dueDate: "2026-11-03"
  },
  {
    id: "INV-2026-054",
    caseId: "RA-2026-0109",
    type: "Proclamation - Debtor",
    amount: 31500,
    status: "Paid",
    issueDate: "2026-10-15",
    dueDate: "2026-10-29"
  },
  {
    id: "INV-2026-055",
    caseId: "RA-2026-0101",
    type: "Client Statement",
    amount: 380000,
    status: "Paid",
    issueDate: "2026-08-25",
    dueDate: "2026-09-08"
  }
];

/* -----------------------------
   Newspaper advertising — 7
   One placement per auction date. Newspaper titles are fictional.
   ----------------------------- */
const adverts = [
  {
    id: "ADV-2026-031",
    newspaper: "The Daily Ledger",
    publishDate: "2026-10-15",
    auctionDate: "2026-10-22",
    status: "Published",
    caseId: "RA-2026-0103"
  },
  {
    id: "ADV-2026-032",
    newspaper: "Business Weekly",
    publishDate: "2026-10-20",
    auctionDate: "2026-10-27",
    status: "Published",
    caseId: "RA-2026-0104"
  },
  {
    id: "ADV-2026-033",
    newspaper: "The Daily Ledger",
    publishDate: "2026-10-22",
    auctionDate: "2026-10-29",
    status: "Published",
    caseId: "RA-2026-0105"
  },
  {
    id: "ADV-2026-034",
    newspaper: "The Daily Ledger",
    publishDate: "2026-10-29",
    auctionDate: "2026-11-05",
    status: "Published",
    caseId: "RA-2026-0106"
  },
  {
    id: "ADV-2026-035",
    newspaper: "Business Weekly",
    publishDate: "2026-11-03",
    auctionDate: "2026-11-10",
    status: "Scheduled",
    caseId: "RA-2026-0107"
  },
  {
    id: "ADV-2026-036",
    newspaper: "Coast Times",
    publishDate: "2026-11-05",
    auctionDate: "2026-11-12",
    status: "Scheduled",
    caseId: "RA-2026-0108"
  },
  {
    id: "ADV-2026-037",
    newspaper: "The Daily Ledger",
    publishDate: "2026-11-10",
    auctionDate: "2026-11-17",
    status: "Scheduled",
    caseId: "RA-2026-0109"
  }
];

/* Expose on window too, so the data is easy to inspect from the console. */
window.currentUser = currentUser;
window.clients = clients;
window.cases = cases;
window.vehicles = vehicles;
window.invoices = invoices;
window.adverts = adverts;
