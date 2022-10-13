import { TObject } from '../types/global';

const menuItems = (appStrings: TObject) => {
  return [
    {
      id: 1,
      title: appStrings.home,
      options: [
        {
          name: appStrings.projects,
          redirectTo: '/projects',
          hasIcon: true,
        },
        {
          name: appStrings.materials,
          redirectTo: '/materials',
          hasIcon: true,
        },
      ],
    },
  ];
};

export default menuItems;
