import {
  InputGroup,
  InputLeftElement,
  Input,
  InputProps,
} from '@chakra-ui/react';
import { MagnifyingGlass } from 'phosphor-react';
import styles from './SearchInput.module.css';

const SearchInput: React.FC<InputProps> = props => {
  const { className } = props;
  return (
    <InputGroup>
      <InputLeftElement
        className={styles.search_icon}
        children={<MagnifyingGlass />}
      />
      <Input {...props} className={`${styles.search_button} ${className}`} />
    </InputGroup>
  );
};

export default SearchInput;
