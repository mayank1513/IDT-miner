import AppDetails from "@/components/AppDetails";
import { Info } from "types";
import { useEffect, useReducer } from "react";
import Link from "next/link";
import { useIDTContext, updateApps } from '@/store/index'

type HomeState = {
  showModal: boolean;
  selectedAppId: number;
};

const ACTION_SET_MODAL_VISIBLE = "modal-visible";
const ACTION_SELECT_APP = "select-app";

const setModalVisible = (visible: boolean) => ({
  type: ACTION_SET_MODAL_VISIBLE,
  visible,
});
const selectApp = (id: number) => ({ type: ACTION_SELECT_APP, id });

const reducer = (state: HomeState, action: any) => {
  switch (action.type) {
    case ACTION_SET_MODAL_VISIBLE:
      return { ...state, showModal: action.visible };
    case ACTION_SELECT_APP:
      return { ...state, selectedAppId: action.id };
  }
  return state;
};

export default function Home() {
  const [{ showModal, selectedAppId }, dispatch] = useReducer(reducer, {
    showModal: false,
    selectedAppId: 0,
  });

  const [{ apps }, setSharedState] = useIDTContext();

  const updateProjects = () => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setSharedState(updateApps(data));
      })
      .finally(() => {
        dispatch(setModalVisible(false));
      });
  };

  useEffect(() => {
    updateProjects();
  }, []);

  return (
    <section>
      {apps.length != 0 && (
        <Main>
          <ul className="appList">
            {apps.map((app: Info, ind: number) => (
              <li key={app.dir} onClick={() => dispatch(selectApp(ind))}>
                {app.appName}
                <span className="spacer"></span>
                <Link href={`/${app.dir}`}>
                  <img src="/external-link.svg" alt="" />
                </Link>
              </li>
            ))}
          </ul>
          <AppDetails
            key={selectedAppId}
            info={apps[selectedAppId]}
            createNew={false}
            updateApps={updateProjects}
          />
        </Main>
      )}
      <FloatingButton
        onClick={() => dispatch(setModalVisible(true))}
        className={apps.length ? "" : "fullscreen"}
      >
        +
      </FloatingButton>
      {showModal && (
        <Modal onClick={() => {
          dispatch(setModalVisible(false));
        }}>
          <div className="modalContent" onClick={e => e.stopPropagation()}>
            <AppDetails
              info={new Info()}
              createNew={true}
              updateApps={updateProjects}
            />
          </div>
        </Modal>
      )}
    </section>
  );
}

import styled from "styled-components";

const Main = styled.div/*css */`
  display: flex;
  width: 100vw;
  & > * {
    flex-grow: 1;
    height: 100%;
    margin: 0;
    border-left: 1px solid gray;
    border-right: 1px solid gray;
    box-sizing: content-box;
  }
  .appList {
    list-style-type: none;
    transition: all 0.5s;
    li {
      margin: 0 20px;
      padding: 10px;
      border-bottom: 1px solid gray;
      cursor: pointer;
      display: flex;
      align-items: center;
      &:hover {
        font-weight: bold;
        background: #0005;
      }
      span {
        flex-grow: 1;
      }
      img {
        padding: 10px;
        border-radius: 10px;
      }
      img:hover {
        background: #f005;
      }
    }
  }
`;

const FloatingButton = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  font-size: 4em;
  font-weight: bold;
  height: 1em;
  width: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: red;
  border-radius: 50%;
  cursor: pointer;
  &:hover {
    box-shadow: 0 0 5px red;
  }
  &.fullscreen {
    top: 20px;
    left: 20px;
    margin: auto;
    font-size: 6em;
  }
`;

const Modal = styled.div/*css */`
  background: #0035;
  position: fixed;
  padding: 50px;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  .modalContent {
    background: white;
    max-width: 800px;
    max-height: 80vh;
    margin: auto;
    overflow: auto;
    border-radius: 10px;
    padding: 10px;
    ::-webkit-scrollbar {
      width: 10px;  /* Remove scrollbar space */
      background: transparent;  /* Optional: just make scrollbar invisible */
      border-radius: 10px;
  }
  /* Optional: show position indicator in red */
  ::-webkit-scrollbar-thumb {
      background: #5552;
      border-radius: 10px;
  }
  }
`;
