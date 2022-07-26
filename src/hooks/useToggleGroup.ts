import { useState } from 'react';

export type TToggles = { [key: string]: boolean };

const useToggleGroup = (toggles: TToggles) => {
  const [state, setState] = useState(toggles);

  const toggle = (toggleId: string, newState?: boolean) =>
    setState(prevState => ({
      ...prevState,
      [toggleId]:
        newState ?? typeof state[toggleId] === 'boolean'
          ? !state[toggleId]
          : false,
    }));

  const addNewToggle = (toggleId: string, state: boolean) =>
    toggle(toggleId, state);

  const resetAll = (exceptions?: TToggles) => {
    const newState: TToggles = {};
    Object.keys(state).forEach(toggleId => {
      newState[toggleId] = !!exceptions?.[toggleId];
    });
    setState(newState);
  };

  const uniqueToggleOn = (toggleId: string) => resetAll({ [toggleId]: true });

  return {
    toggles: state,
    toggle,
    addNewToggle,
    uniqueToggleOn,
    resetAll,
  };
};

export default useToggleGroup;
