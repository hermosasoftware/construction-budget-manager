import React, { Component, useContext, useState } from 'react';
import { Placement } from '@chakra-ui/react';
import ThirdPartyDatePicker, {
  ReactDatePickerProps,
  registerLocale,
} from 'react-datepicker';
import FormControl, {
  IFormControl,
} from '../../Layout/FormControl/FormControl';
import { IFormElementProps } from '../../../../../types/forms';
import { FormContext } from '../../Form';
import { Calendar } from 'phosphor-react';
import { useAppSelector } from '../../../../../redux/hooks';
import { isDate, isValidDate } from '../../../../../utils/dates';

import 'react-datepicker/dist/react-datepicker.css';
import styles from './DatePicker.module.css';

import es from 'date-fns/locale/es';

registerLocale('es', es);

type TThirdPartyDatePickerProps = Omit<
  ReactDatePickerProps,
  'name' | 'value' | 'onChange' | 'onBlur' | 'onKeyDown' | 'onFocus'
>;

interface IDatePicker
  extends IFormControl,
    IFormElementProps,
    TThirdPartyDatePickerProps {
  placeholder?: string;
  placement?: Placement;
}

const DatePicker: React.FC<IDatePicker> = props => {
  const formControlProps: IFormControl = props;
  const thirdPartyProps: TThirdPartyDatePickerProps = props;
  const {
    name,
    innerId,
    innerClassName,
    placement,
    startDate,
    endDate,
    selectsStart,
    selectsEnd,
  } = props;

  const { formId, initialFormData, formData, updateFormData, errors } =
    useContext(FormContext);

  const { appLang, appStrings } = useAppSelector(state => state.settings);
  const [selected, setSelected] = useState<Date | null>(
    initialFormData?.[name] ?? formData?.[name] ?? null,
  );

  const uuid = innerId || `${formId}-${name}`;

  const handleOnDateChange = (newValue: Date | null) => {
    if (newValue !== selected) {
      updateFormData?.({ name, value: newValue });
      setSelected(newValue);
    }
  };

  const checkDateFormat = (date: any) => {
    const dateValue = isValidDate(date, appLang);
    return isDate(dateValue) ? (dateValue as Date) : null;
  };

  const handleOnInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event?.target?.value;
    if (newValue !== undefined) {
      const dateValue = checkDateFormat(newValue);
      updateFormData?.({ name, value: newValue });
      setSelected(dateValue);
    }
  };

  const internalStartDate = checkDateFormat(startDate);
  const internalEndDate = checkDateFormat(endDate);

  const thirdPartyFinalProps: ReactDatePickerProps = {
    id: uuid,
    name,
    customInput: <CustomInput />,
    placeholderText: appStrings?.shortDateFormatPlaceholder,
    allowSameDay: true,
    onChange: handleOnDateChange,
    onChangeRaw: handleOnInputChange,
    popperPlacement: placement,
    locale: appLang,
    dateFormat: 'P',
    enableTabLoop: false,
    ...thirdPartyProps,
    selected,
    className: `${styles.date_picker__input} ${innerClassName}`,
    startDate: internalStartDate,
    endDate: internalEndDate,
    minDate: selectsEnd ? internalStartDate : undefined,
    maxDate: selectsStart ? internalEndDate : undefined,
  };

  return (
    <FormControl
      innerId={uuid}
      errorMessage={errors[name]}
      {...formControlProps}
    >
      <ThirdPartyDatePicker {...thirdPartyFinalProps} />
    </FormControl>
  );
};

class CustomInput extends Component<any, any> {
  render() {
    const { onClick, ...rest } = this.props;
    return (
      <div
        className={`center-content-cross ${styles.date_picker__container}`}
        onClick={onClick}
      >
        <Calendar size={30} />
        <input {...rest} type="text" />
      </div>
    );
  }
}

export default DatePicker;
