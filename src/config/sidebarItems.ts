import { TObject } from '../types/global';

const menuItems = (appStrings: TObject) => {
  return [
    {
      id: 1,
      title: 'Home',
      options: [
        {
          name: 'Projects',
          redirectTo: '/projects',
          hasIcon: true,
        },
        {
          name: 'Materials',
          redirectTo: '/materials',
          hasIcon: true,
        },
      ],
    },
  ];
};

export default menuItems;
