import { TObject } from '../types/global';

const menuItems = (appStrings: TObject, isAdminUser: boolean) => {
  const items = [
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
  ];
  const adminItems = isAdminUser
    ? [
        {
          name: appStrings.users,
          redirectTo: '/users',
          hasIcon: true,
        },
      ]
    : [];

  return [
    {
      id: 1,
      title: appStrings.home,
      options: [...items, ...adminItems],
    },
  ];
};

export default menuItems;
