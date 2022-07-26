import { IButton } from '../../components/common/Button/Button';

export const ButtonStyles = {
  baseStyle: {
    padding: '0px var(--btn-padding-sm)',
    fontSize: 'var(--btn-font-size)',
    fontWeight: 'var(--chakra-fontWeights-normal)',
    lineHeight: 'var(--chakra-lineHeights-5)',
  },
  shapes: {
    'min-rounded': {
      borderRadius: 'var(--btn-border-radius-sm)',
    },
    normal: {
      borderRadius: 'var(--btn-border-radius-md)',
    },
    'max-rounded': {
      borderRadius: 'var(--btn-border-radius-xlg)',
    },
    rectangular: {
      borderRadius: '0px',
    },
  },
  variants: {
    solid: (props: IButton) => ({
      color: props.colorScheme === 'primary' ? 'white' : 'black',
    }),
    ghost: () => ({
      color: 'black',
    }),
    outline: () => ({ color: 'black' }),
    link: () => ({ color: 'black' }),
  },
  defaultProps: {
    colorScheme: 'primary',
  },
};

export type TButtonShapes = keyof typeof ButtonStyles.shapes;
export const DEFAULT_SHAPE: TButtonShapes = 'normal';
export const DEFAULT_COLOR_SCHEME = 'primary';
