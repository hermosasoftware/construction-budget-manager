import { ThemeConfig, extendTheme } from '@chakra-ui/react';
import { createBreakpoints } from '@chakra-ui/theme-tools';
import { ButtonStyles as Button } from './Button/ButtonStyles';
import { InputStyles as Input } from './Input/InputStyles';
import { FormPartsStyles as Form } from './FormPartsStyles/FormPartsStyles';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const breakpoints = createBreakpoints({
  sm: '30em',
  md: '60em',
  lg: '70em',
  xl: '80em',
});

export const mavTheme = extendTheme({
  colors: {
    black: '#2D3748',
    success: '#38A169',
    light_success: '#C6F6D5',
    dark_success: '#276749',
    primary: {
      50: '#00000015',
      500: '#000',
      600: '#333',
    },
    secondary: {
      50: '#ebebeb',
      500: '#ebebeb',
      600: '#d1d1d1',
    },
    accent: {
      50: '#EDF2F7',
      500: '#EDF2F7',
      600: '#CEDBE9',
    },
    side_bar_background: '#EEE',
    text_ghost: '#A3A3A3',
    dark_ghost: 'rgba(0, 0, 0, 0.64)',
    divider_disable: '#E2E8F0',
    text_disable: '#DFDFDF',
    bubble_background: 'rgba(0, 0, 0, 0.04)',
    help_text: '#9F7AEA',
    light_border: '#CBD5E0',
    plain_white: '#FFFFFF',
    light_text: 'rgba(255, 255, 255, 0.8)',
    fade_text: 'rgba(255, 255, 255, 0.36)',
    dark_text: '#9E9E9E',
    placeholder_color: 'rgba(0, 0, 0, 36%)',
    modal_dialog_body: '#718096',
    focus_color: '#3182C3',
  },
  components: {
    Button,
    Input,
    Form,
  },
  config,
  breakpoints,
});
