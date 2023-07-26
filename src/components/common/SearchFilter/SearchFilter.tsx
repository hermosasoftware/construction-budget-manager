import {
  InputGroup,
  Input,
  useDisclosure,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ListItem,
  List,
  Divider,
  Grid,
} from '@chakra-ui/react';
import { FadersHorizontal } from 'phosphor-react';
import { useState } from 'react';
import { useAppSelector } from '../../../redux/hooks';
import {
  formatDate,
  getPreviousDay,
  getPreviousMonth,
  getPreviousWeek,
  getPreviousYear,
  isDate,
} from '../../../utils/dates';
import SearchInput from '../SearchInput';

import styles from './SearchDate.module.css';

interface SearchFiterProps {
  handleFirstDateChange: Function;
  handleSecondDateChange: Function;
}

const filterOptions = [
  {
    label: 'name',
    content: [],
  },
  {
    label: 'Work',
    content: [
      { label: 'Work', value: 'Work' },
      { label: 'pool', value: 'pool' },
      { label: 'Piso de arriba', value: 'Piso de arriba' },
    ],
  },
  {
    label: 'Owner',
    content: [
      {
        label: 'GONZALEZ BORGE JOSE DENNIS',
        value: 'GONZALEZ BORGE JOSE DENNIS',
      },
      { label: 'Luis Miguel Salazar', value: 'Luis Miguel Salazar' },
      { label: 'Pablo Vazques Herrera', value: 'Pablo Vazques Herrera' },
    ],
  },
  {
    label: 'Date',
    content: [
      {
        label: 'Today',
        value: new Date(),
      },
      { label: 'Yersterday', value: getPreviousDay() },
      { label: 'This Week', value: getPreviousWeek() },
      { label: 'This Month', value: getPreviousMonth() },
      { label: 'This Year', value: getPreviousYear() },
    ],
  },
];

const SearchFilter: React.FC<SearchFiterProps> = props => {
  const appStrings = useAppSelector(state => state.settings.appStrings);
  const [firstDate, setFirstDate] = useState<Date>(new Date());
  const [secondDate, setSecondDate] = useState<Date>(new Date());
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleFirstDateChange = (event: { target: { value: any } }) =>
    setFirstDate(event.target.value);

  const handleSecondDateChange = (event: { target: { value: any } }) =>
    setSecondDate(event.target.value);

  const [selectedOption, setSelectedOption] = useState('name');

  const handleSearch = async (event: { target: { value: string } }) => {
    console.log('cambie');
    // setSearchTerm(event.target.value.toUpperCase());
  };

  return (
    <InputGroup>
      {selectedOption !== 'Date' ? (
        <SearchInput
          style={{ margin: '0 10px 0 0', maxWidth: '500px' }}
          placeholder={appStrings.search}
          onChange={handleSearch}
        ></SearchInput>
      ) : (
        <>
          <Input
            value={formatDate(firstDate, 'YYYY-MM-DD')}
            type="date"
            className={styles.dateSelect}
            onChange={handleFirstDateChange}
          />
          <Input
            value={formatDate(secondDate, 'YYYY-MM-DD')}
            type="date"
            className={styles.dateSelect}
            onChange={handleSecondDateChange}
          />
        </>
      )}

      <Button
        className={styles.filter_button}
        rightIcon={<FadersHorizontal />}
        size="sm"
        variant={'ghost'}
        onClick={onOpen}
      >
        Filters
      </Button>

      <Modal onClose={onClose} isOpen={isOpen} isCentered size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Search Filters</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid
              templateColumns={`repeat(${filterOptions.length}, 1fr)`}
              gap={6}
            >
              {filterOptions.map((option, key) => (
                <List spacing={3} key={key}>
                  <ListItem
                    className={styles.p}
                    onClick={() => {
                      setSelectedOption(option.label);
                      onClose();
                      console.log(option.label);
                    }}
                  >
                    {option.label}
                  </ListItem>
                  <Divider />
                  {option.content.map((element, key) => (
                    <ListItem
                      className={styles.p}
                      onClick={() => {
                        typeof isDate(element.value)
                          ? setFirstDate(element.value as Date)
                          : setSelectedOption(option.label);
                        setSelectedOption(option.label);
                        onClose();
                        console.log(element.value);
                      }}
                      key={key}
                    >
                      {element.label}
                    </ListItem>
                  ))}
                </List>
              ))}
            </Grid>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </InputGroup>
  );
};
export default SearchFilter;
