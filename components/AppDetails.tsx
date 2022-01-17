import { Info } from "types";
import { useState } from "react";
import { FormEventHandler, FormEvent } from "react";

interface props {
  info: Info;
  createNew: boolean;
  updateApps: Function;
}

function saveInfo(infoState: Info, updateApps: Function, setNeed: Function, createNew = false) {
  if (!infoState.appName) {
    alert("You must provide a name for your project");
    return;
  }
  if (
    !infoState.baseUrl ||
    !infoState.baseUrl.startsWith("https://audio.iskcondesiretree.com/")
  ) {
    alert("baseUrl must start with https://audio.iskcondesiretree.com/");
    return;
  }

  fetch("/api/create-project", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      info: infoState,
      createNew,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log('data', data);
      if (data.err) {
        alert(data.err);
      }
    })
    .catch((err) => {
      console.log('err', err);
    })
    .finally(() => {
      updateApps();
      setNeed(false)
    });
}

const AppDetails = ({
  info = new Info(),
  createNew = false,
  updateApps,
}: props) => {
  const [infoState, setInfoState_] = useState<Info>({ ...new Info(), ...info });
  const [needToUpdate, setNeed] = useState(false);
  function setInfoState(state: Info) {
    setNeed(true);
    setInfoState_(state);
  }
  const onSubmit: FormEventHandler = (e: FormEvent) => {
    e.preventDefault();
    if (!needToUpdate) return;
    saveInfo(infoState, updateApps, setNeed, createNew);
    // https://audio.iskcondesiretree.com/
  };
  return (
    <Form onSubmit={onSubmit}>
      <fieldset>
        <legend>App Info</legend>
        <table>
          <tbody>
            {Object.keys(infoState)
              .filter((key) => !["dir", 'i18n', 'flags'].includes(key))
              .map((key) => (
                <tr key={key}>
                  <td>
                    <label htmlFor={key}>
                      {`${key.charAt(0).toUpperCase()}${key
                        .substring(1)
                        .split(/(?=[A-Z])/)
                        .join(" ")}`}
                    </label>
                  </td>
                  <td>
                    <input
                      type="text"
                      // @ts-ignore
                      value={infoState[key]}
                      id={key}
                      onChange={(e) =>
                        setInfoState({ ...infoState, [key]: e.target.value })
                      }
                    />
                  </td>
                  <td> </td>
                </tr>
              ))}
            {
              Object.keys(infoState.flags).map(k => (<tr key={k}>
                <td><label htmlFor={k}>
                  {`${k.charAt(0).toUpperCase()}${k
                    .substring(1)
                    .split(/(?=[A-Z])/)
                    .join(" ")}`}</label></td>
                {/* @ts-ignore */}
                <td><input type="checkbox" id={k} checked={infoState.flags[k]}
                  onChange={() => {
                    // @ts-ignore
                    infoState.flags[k] = !infoState.flags[k];
                    setInfoState({ ...infoState })
                  }} /></td>
                <td></td></tr>))
            }
          </tbody>
        </table>
      </fieldset>
      <fieldset>
        <legend>Title Languages</legend>
        <table>
          <tbody>
            <tr>
              <td><label>en</label></td>
              <td>English</td>
              <td> </td>
            </tr>
            {
              Object.keys(infoState.i18n.labelLangs).filter(k => k !== 'en').map(l => (
                // @ts-ignore
                <tr key={l}><td><label>{l}</label></td><td>{infoState.i18n.labelLangs[l]}</td>
                  <td className="del" onClick={() => {
                    if (confirm('You are about to delete a language. \n\nThis is irreversible. Are you sure?')) {
                      // @ts-ignore
                      delete infoState.i18n.labelLangs[l]
                      setInfoState({ ...infoState })
                      !createNew && saveInfo(infoState, updateApps, setNeed);
                    }
                  }}>⛔</td>
                </tr>
              ))
            }
          </tbody>
        </table>
        <Button onClick={() => {
          const l = prompt('Enter the language you want to add in following format\n\nshort name:display name  (example -- en:English)', 'en:English')
          if (l?.match(/[a-z:A-Z]/) && l.includes(':')) {
            const tmp = l.split(':')
            // @ts-ignore
            infoState.i18n.labelLangs[tmp[0].trim()] = tmp[1].trim();
            setInfoState({ ...infoState })
            !createNew && saveInfo(infoState, updateApps, setNeed);
          } else {
            alert('You did not enter language in right format. \n\nPlease try again')
          }
        }}>Add Language</Button>
      </fieldset>
      <fieldset>
        <legend>Audio Languages</legend>
        <table>
          <tbody>
            {
              Object.keys(infoState.i18n.audioLangs).map(l => (
                // @ts-ignore
                <tr key={l}><td><label>{l}</label></td><td>{infoState.i18n.audioLangs[l]}</td>
                  <td className="del" onClick={() => {
                    if (confirm('You are about to delete a language. \n\nThis is irreversible. Are you sure?')) {
                      // @ts-ignore
                      delete infoState.i18n.audioLangs[l]
                      setInfoState({ ...infoState })
                      !createNew && saveInfo(infoState, updateApps, setNeed);
                    }
                  }}>⛔</td>
                </tr>
              ))
            }
          </tbody>
        </table>
        <Button onClick={() => {
          const l = prompt('Enter the language you want to add in following format\n\nshort name:display name  (example -- en:English)', 'en:English')
          if (l?.match(/[a-z:A-Z]/) && l.includes(':')) {
            const tmp = l.split(':')
            // @ts-ignore
            infoState.i18n.audioLangs[tmp[0].trim()] = tmp[1].trim();
            setInfoState({ ...infoState })
            !createNew && saveInfo(infoState, updateApps, setNeed);
          } else {
            alert('You did not enter language in right format. \n\nPlease try again')
          }
        }}>Add Language</Button>
      </fieldset>
      <Button className={!needToUpdate && "disable"} onClick={onSubmit}>{createNew ? "Create" : "Update Info"}</Button>
    </Form>
  );
};

export default AppDetails;

import styled from "styled-components";
import { keyframes } from "styled-components";

const fade = keyframes/*css */`
from {
  opacity: 0;
}
to {
  opacity: 1;
}
`

const Form = styled.form/*css */`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  animation: ${fade} 1s;
  fieldset {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  table, fieldset {
    width: 100%;
  }
  td {
    padding: 5px;
    input {
      width: 100%;
    }
  }
  label {
    font-weight: bold;
    display: block;
    text-align: end;
    &:after {
      content: ":";
    }
  }
  .del {
    cursor: pointer;
  }
`;

const Button = styled.div/*css */`
  margin: 20px;
  padding: 10px 40px;
  border-radius: 10px;
  border: 1px solid gray;
  cursor: pointer;
  &:hover{
    background: linear-gradient(to bottom right, red, yellow);
  }
  &.disable {
    opacity: .25;
  }
`;
