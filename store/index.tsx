import {
  createContext,
  useContext,
  useReducer,
  ReactElement,
  Dispatch,
} from "react";
import type { Info } from "types";

type HomeState = {
  showModal: boolean;
  apps: Array<Info>;
  selectedAppId: number;
};

const ACTION_SHOW_MODAL = "show-modal";
const ACTION_HIDE_MODAL = "hide-modal";
const ACTION_UPDATE_APPS = "update-apps";
const ACTION_SELECT_APP = "select-app";

export const hideModal = () => ({ type: ACTION_HIDE_MODAL });
export const showModal = () => ({ type: ACTION_SHOW_MODAL });
export const updateApps = (apps: Array<Info>) => ({
  type: ACTION_UPDATE_APPS,
  apps,
});
export const selectApp = (id: number) => ({ type: ACTION_SELECT_APP, id });

const dispatch = (state: HomeState, action: any) => {
  switch (action.type) {
    case ACTION_HIDE_MODAL:
      return { ...state, showModal: false };
    case ACTION_SHOW_MODAL:
      return { ...state, showModal: true };
    case ACTION_SELECT_APP:
      return { ...state, selectedAppId: action.id };
    case ACTION_UPDATE_APPS:
      return { ...state, apps: action.apps };
  }
  return state;
};

const initialState: HomeState = {
  showModal: false,
  apps: [],
  selectedAppId: 0,
};
const HomeContext = createContext<[HomeState, Dispatch<any>]>([
  initialState,
  () => {},
]);

export default function HomeWrapper({ children }: { children: ReactElement }) {
  const [sharedState, setSharedState] = useReducer(dispatch, initialState);

  return (
    <HomeContext.Provider value={[sharedState, setSharedState]}>
      {children}
    </HomeContext.Provider>
  );
}

export function useHomeContext() {
  return useContext(HomeContext);
}
