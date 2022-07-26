export interface IMenuItems {
  id: number;
  title: String;
  options: {
    name: String;
    redirectTo: String;
    hasIcon: boolean;
  }[];
}
