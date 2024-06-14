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
  Divider,
  useColorModeValue,
  Badge,
  Flex,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { FadersHorizontal } from 'phosphor-react';
import { Dispatch, useEffect, useState } from 'react';
import { useAppSelector } from '../../../redux/hooks';
import { TObject } from '../../../types/global';
import {
  formatDate,
  getPreviousDay,
  getPreviousMonth,
  getPreviousWeek,
  getPreviousYear,
  isDate,
  isValidDate,
} from '../../../utils/dates';
import SearchInput from '../SearchInput';

import styles from './SearchFilter.module.css';

export interface SearchFilterProps {
  search: Search;
  setSearch: Dispatch<React.SetStateAction<Search>>;
  data: any[];
  options: FilterOption[];
}

export interface Search {
  selectedOption: Option;
  searchTerm: string;
  firstDate: Date;
  secondDate: Date;
}

export interface FilterOption {
  name: string;
  value: string | number | Date;
  hasSuggestions: boolean;
}

export interface Option {
  label: string;
  value: string | number | Date;
  suggestions?: Option[];
}

export const handleFilterSearch = (value: any, search: Search) => {
  if (!isDate(search?.selectedOption?.value)) {
    return (
      search?.searchTerm === '' ||
      value[search?.selectedOption?.label]
        .toString()
        .toUpperCase()
        .includes(search?.searchTerm?.toString()?.toUpperCase())
    );
  } else {
    let date = new Date(value[search?.selectedOption?.label]);
    let firstDate = new Date(search?.firstDate);
    let secondDate = new Date(search?.secondDate);
    return date >= firstDate && date <= secondDate;
  }
};

export const mapFilterOptions = (
  data: any[],
  attributes: FilterOption[],
  appStrings: TObject<any, string>,
) => {
  const suggestionsLimit = 100;
  const options: Option[] = attributes?.map((attribute: FilterOption) => ({
    label: attribute?.name,
    value: attribute?.value,
    suggestions: !isDate(attribute?.value)
      ? []
      : [
          { label: appStrings?.today, value: new Date() },
          { label: appStrings?.yesterday, value: getPreviousDay() },
          { label: appStrings?.thisWeek, value: getPreviousWeek() },
          { label: appStrings?.thisMonth, value: getPreviousMonth() },
          { label: appStrings?.thisYear, value: getPreviousYear() },
        ],
  }));

  data?.forEach(item => {
    attributes?.forEach((attribute, index) => {
      const value = item[attribute?.name];
      const length = options[index]?.suggestions?.length;
      if (
        attribute?.hasSuggestions &&
        Number(length) < suggestionsLimit &&
        !isDate(attribute?.value) &&
        !options[index]?.suggestions?.some(item => item?.value === value)
      ) {
        options[index]?.suggestions?.push({
          label: value,
          value: value,
        });
      }
    });
  });

  return options;
};

const SearchFilter: React.FC<SearchFilterProps> = props => {
  const { search, setSearch, data, options } = props;
  const { appLang, appStrings } = useAppSelector(state => state.settings);
  const textColor = useColorModeValue('teal.500', 'teal.300');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [filterOptions, setFilterOptions] = useState<Option[]>(
    mapFilterOptions(data, options, appStrings),
  );

  const handleFirstDateChange = (event: { target: { value: any } }) =>
    setSearch({ ...search, firstDate: event.target.value });

  const handleSecondDateChange = (event: { target: { value: any } }) =>
    setSearch({ ...search, secondDate: event.target.value });

  const handleSearchChange = (event: { target: { value: string } }) =>
    setSearch({ ...search, searchTerm: event.target.value });

  const handleOnClick = (option: Option, value: string | number | Date) => {
    isValidDate(value, appLang)
      ? setSearch({
          ...search,
          selectedOption: option,
          firstDate: value as Date,
        })
      : setSearch({
          ...search,
          selectedOption: option,
          searchTerm: value as string,
        });
    onClose();
  };

  useEffect(
    () => setFilterOptions(mapFilterOptions(data, options, appStrings)),
    [data, options],
  );

  return (
    <InputGroup className={styles.main_container}>
      {!isDate(search?.selectedOption?.value) ? (
        <SearchInput
          value={search?.searchTerm}
          parentClassName={styles.search_container}
          className={styles.search_input}
          placeholder={appStrings.search}
          onChange={handleSearchChange}
        />
      ) : (
        <>
          <Input
            value={formatDate(search?.firstDate, 'YYYY-MM-DD')}
            type="date"
            className={styles.date_select}
            onChange={handleFirstDateChange}
          />
          <Input
            value={formatDate(search?.secondDate, 'YYYY-MM-DD')}
            type="date"
            className={styles.date_select}
            onChange={handleSecondDateChange}
          />
        </>
      )}
      <Button
        className={styles.filter_button}
        rightIcon={<FadersHorizontal />}
        size="sm"
        variant="ghost"
        onClick={onOpen}
      >
        {appStrings.filters}
      </Button>
      <Modal
        onClose={onClose}
        isOpen={isOpen}
        isCentered
        size="6xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{appStrings.searchFilters}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDir="column" gap={6}>
              {filterOptions.map((option, key) => (
                <Wrap spacing={3} key={key}>
                  <WrapItem
                    className={styles.title_option}
                    color={
                      search.selectedOption?.label === option?.label
                        ? textColor
                        : 'current'
                    }
                    onClick={() => handleOnClick(option, option?.value)}
                  >
                    {option?.label?.toLocaleUpperCase()}
                  </WrapItem>
                  <Divider />
                  {option?.suggestions?.map((element, key) => (
                    <WrapItem
                      className={styles.item}
                      onClick={() => handleOnClick(option, element?.value)}
                      key={key}
                    >
                      <Badge>{element?.label}</Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              ))}
            </Flex>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </InputGroup>
  );
};
export default SearchFilter;
