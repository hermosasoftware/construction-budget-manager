import { TObject } from '../types/global';

const menuItems = (appStrings: TObject) => {
  return [
    {
      id: 1,
      title: appStrings?.Global?.myAccount,
      options: [
        {
          name: appStrings?.Global?.home,
          redirectTo: '/home',
          hasIcon: false,
        },
        {
          name: appStrings?.Global?.clients,
          redirectTo: '/clients',
          hasIcon: true,
        },
      ],
    },
    {
      id: 2,
      title: appStrings?.Global?.countability,
      options: [
        {
          name: appStrings?.Global?.invoices,
          redirectTo: '/invoices',
          hasIcon: true,
        },
      ],
    },
    {
      id: 3,
      title: appStrings?.Global?.administration,
      options: [
        {
          name: appStrings?.Global?.products,
          redirectTo: '/products',
          hasIcon: true,
        },
        {
          name: appStrings?.Global?.reports,
          redirectTo: '/reports',
          hasIcon: false,
        },
      ],
    },
  ];
};

export default menuItems;
