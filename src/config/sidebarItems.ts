import { TObject } from '../types/global';

const menuItems = (appStrings: TObject) => {
  return [
    {
      id: 1,
      title: 'Inicio',
      options: [
        {
          name: 'Proyectos',
          redirectTo: '/projects',
          hasIcon: true,
        },
        {
          name: 'Materiales',
          redirectTo: '/materiales',
          hasIcon: true,
        },
      ],
    },
  ];
};

export default menuItems;
