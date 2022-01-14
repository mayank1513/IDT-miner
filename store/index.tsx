import {
  createContext,
  useContext,
  useReducer,
  ReactElement,
  Dispatch,
} from "react";
import type { Info } from "types";

type SharedStateType = {
  apps: Array<Info>;
};

const ACTION_UPDATE_APPS = "update-apps";

export const updateApps = (apps: Array<Info>) => ({
  type: ACTION_UPDATE_APPS,
  apps,
});

const dispatch = (state: SharedStateType, action: any) => {
  switch (action.type) {
    case ACTION_UPDATE_APPS:
      return { ...state, apps: action.apps };
  }
  return state;
};

const initialState: SharedStateType = {
  apps: [],
};
const IDTContext = createContext<[SharedStateType, Dispatch<any>]>([
  initialState,
  () => {},
]);

export default function AppWrapper({ children }: { children: ReactElement }) {
  const [sharedState, setSharedState] = useReducer(dispatch, initialState);

  return (
    <IDTContext.Provider value={[sharedState, setSharedState]}>
      {children}
    </IDTContext.Provider>
  );
}

export function useIDTContext() {
  return useContext(IDTContext);
}
