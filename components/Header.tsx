import type { NextComponentType } from "next";
import Image from "next/image";
import styled from "styled-components";

const StyledHeader = styled.header/*css */`
  position: fixed;
  width: 100%;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-bottom: 1px solid #80808080;
  box-shadow: 0 0 10px gray;
  .logo {
    padding: 0 15px !important;
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

const Header: NextComponentType = () => {
  return (
    <StyledHeader>
      <Image
        src="/logo.png"
        height={42}
        width={72}
        className="logo"
        alt="logo"
      ></Image>
      <h2>Krishna Apps Audio Apps Data Prep Tool</h2>
      <span className="spacer"></span>
      <div className="menu">
        <div />
        <div />
        <div />
      </div>
    </StyledHeader>
  );
};

export default Header;
