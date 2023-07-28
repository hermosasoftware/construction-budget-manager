import {
  InputGroup,
  InputLeftElement,
  Input,
  InputProps,
} from '@chakra-ui/react';
import { MagnifyingGlass } from 'phosphor-react';

import styles from './SearchInput.module.css';

interface Props {
  parentClassName?: string;
}
const SearchInput: React.FC<InputProps & Props> = props => {
  const { parentClassName, className, ...rest } = props;
  return (
    <InputGroup className={parentClassName}>
      <InputLeftElement
        className={styles.search_icon}
        children={<MagnifyingGlass />}
      />
      <Input {...rest} className={`${styles.search_button} ${className}`} />
    </InputGroup>
  );
};

export default SearchInput;
