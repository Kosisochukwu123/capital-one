export const bankData = {
  user: {
    firstName: "Joshua",
    middleName: "Tyler",
    lastName: "Adams",

    fullName: "Adams Joshua",

    username: "1110378",
    email: "demo@example.test",
    dateOfBirth: "1982-08-13",
    phone: "15033130008",

    country: "United States",
    state: "Utah",

    transferStatus: "ACTIVE",
  },

  account: {
    maskedNumber: "2750",
    openedAt: "September 13, 2026",

    checking: {
      id: "checking",
      name: "Checking",
      balance: 20_000_000,
    },

    savings: {
      id: "savings",
      name: "Savings",
      balance: 5_000_000,
    },
  },

  transactions: [
    {
      id: "txn-1",
      title: "Deposit",
      date: "Aug 20",
      amount: 5_000_000,
      type: "credit",
    },
    {
      id: "txn-2",
      title: "Deposit",
      date: "Jul 23",
      amount: 10_000_000,
      type: "credit",
    },
    {
      id: "txn-3",
      title: "Deposit",
      date: "May 20",
      amount: 10_000_000,
      type: "credit",
    },
  ],
};
