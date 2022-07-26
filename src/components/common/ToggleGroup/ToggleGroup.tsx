import React from 'react';
import { IStyledComponent } from '../../../types/global';
import Button from '../Button/Button';

interface IToggleGroup extends IStyledComponent {
  selectedOption: string;
  options: Array<{
    id: string;
    name: string;
    onClick?: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  }>;
}

const ToggleGroup: React.FC<IToggleGroup> = props => {
  const { options, selectedOption, className, style } = props;

  return (
    <div
      className={`center-content-cross fill-parent-horizontal ${className}`}
      style={style}
    >
      {options?.map(option => (
        <Button
          colorScheme="secondary"
          key={`toggle-group-option-${option.id}`}
          variant={selectedOption === option.id ? 'solid' : 'link'}
          fontSize="sm"
          shape="max-rounded"
          onClick={option.onClick}
        >
          {option.name}
        </Button>
      ))}
    </div>
  );
};

export default ToggleGroup;
