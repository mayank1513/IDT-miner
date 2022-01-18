import type { NextComponentType } from "next";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { useRouter, NextRouter } from "next/router";
import { postAppData } from "@/utils/feHelpers"

const RegEx = 'Add RegExp to replace from all';
const AddPlace = 'Add place';
const AddSpecialPlace = 'Add Special place';
export const Rebuild = 'Rebuiild this album from titles';
export const RebuildSubAlbs = 'Rebuild this and all sub-albums from titles';
export const RebuildAll = 'Rebuild all albums from titles';
export const RebuildFromURL = 'Rebuiild this album from urls';
export const RebuildSubAlbsFromURL = 'Rebuild this and all sub-albums from urls';
export const RebuildAllFromURL = 'Rebuild all albums from urls';

const appMenu: string[] = [RegEx, AddPlace, AddSpecialPlace, Rebuild, RebuildSubAlbs, RebuildAll, RebuildFromURL, RebuildSubAlbsFromURL, RebuildAllFromURL]
const mainMenu: string[] = [RegEx, AddPlace, AddSpecialPlace]

function addRegEx(router: NextRouter) {
  const rx = prompt(`Add RegExp replacement in the format regexp:replacement:flags`, '::');
  if (rx?.match(/^[^:]+:[^:]*:[ig]{0,2}$/)) {
    postAppData({ path: router.query.app || '', rx: rx.split(':').map(r => r.trim()) })
      .then(data => {
        alert(data.msg);
      })
  } else if (rx) {
    alert('Input not recognised');
    addRegEx(router);
  }
}

const handler = (router: NextRouter, m: string) => {
  switch (m) {
    case RegEx:
      addRegEx(router);
      break;
    case AddPlace:
      const place = prompt(`Add place`)?.trim();
      if (place)
        postAppData({ path: router.query.app || '', place })
          .then(data => {
            alert(data.msg);
          })
      break;
    case AddSpecialPlace:
      const specialPlace = prompt(`Add special place`)?.trim();
      if (place)
        postAppData({ path: router.query.app || '', specialPlace })
          .then(data => {
            alert(data.msg);
          })
      break;
    case Rebuild:
    case RebuildAll:
    case RebuildSubAlbs:
    case RebuildFromURL:
    case RebuildSubAlbsFromURL:
    case RebuildAllFromURL:
      if (confirm(`PLease make sure you have saved your changes. Unsaved changes will be overridden?\n\n${m}`)) {
        postAppData({ path: router.query.app, rebuild: m })
          .then(data => {
            alert(data.msg);
            router.reload();
          })
      }
      break;
  }
}
const Header: NextComponentType = () => {
  const router = useRouter();
  return (
    <StyledHeader>
      <Link href="/">
        <a>
          <Image
            src="/logo.png"
            height={42}
            width={72}
            className="logo"
            alt="logo"
          ></Image>
        </a>
      </Link>
      <h2>Krishna Apps Audio Apps Data Prep Tool</h2>
      <span className="spacer"></span>
      <div className="menuContainer">
        <div className="menu">
          <div />
          <div />
          <div />
        </div>
        <ul className="navMenu">
          {
            (router.asPath == "/" ? mainMenu : appMenu).map(m => <li key={m} onClick={() => {
              handler(router, m);
            }}>{m}</li>)
          }
        </ul>
      </div>
    </StyledHeader>
  );
};

export default Header;

const StyledHeader = styled.header/*css */`
  position: fixed;
  width: 100%;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-bottom: 1px solid #80808080;
  box-shadow: 0 0 10px gray;
  .navMenu {
    position: fixed;
    top: 40px;
    right: 30px;
    list-style-type: none;
    background-color: white;
    border-radius: 10px;
    padding: 10px;
    box-shadow: 0 0 5px #555a;
    display: none;
    li {
      padding: 10px;
      border-radius: 10px;
      cursor: pointer;
    }
    li:hover {
      box-shadow: 0 0 5px #555a;
    }
  }
  .menuContainer:hover .navMenu {
    display: block;
  }
  .logo {
    padding: 0 15px !important;
    cursor: pointer;
  }
  .spacer {
    flex-grow: 1;
  }
  .menu {
    display: flex;
    flex-direction: column;
    height: 2.5em;
    width: 2.5em;
    padding: 0.5em;
    align-items: center;
    justify-content: space-evenly;
    cursor: pointer;
    border-radius: 50%;
    margin-right: 15px;
    &:hover {
      box-shadow: 0 0 5px gray;
    }
    div {
      background: currentColor;
      height: 5px;
      width: 5px;
      border-radius: 50%;
    }
  }
`;
