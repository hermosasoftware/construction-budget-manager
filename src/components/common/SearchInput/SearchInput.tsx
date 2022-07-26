import {
  InputGroup,
  InputLeftElement,
  Input,
  InputProps,
} from '@chakra-ui/react';
import { MagnifyingGlass } from 'phosphor-react';
import styles from './SearchInput.module.css';

const SearchInput: React.FC<InputProps> = props => {
  return (
    <InputGroup>
      <InputLeftElement
        className={styles.search_icon}
        children={<MagnifyingGlass />}
      />
      <Input className={styles.search_button} {...props} />
    </InputGroup>
  );
};

export default SearchInput;
