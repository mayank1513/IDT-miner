import { Info } from "types";
import { useState } from "react";
import { FormEventHandler, FormEvent } from "react";

const AppDetails = ({
  info = new Info(),
  createNew = false,
  updateApps,
}: {
  info: Info;
  createNew: boolean;
  updateApps: Function;
}) => {
  const [infoState, setInfoState] = useState(info);
  const onSubmit: FormEventHandler = (e: FormEvent) => {
    e.preventDefault();
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
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        updateApps();
      });
    // https://audio.iskcondesiretree.com/
  };
  return (
    <Form onSubmit={onSubmit}>
      <table>
        <tbody>
          {Object.keys(infoState)
            .filter((key) => key !== "dir")
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
              </tr>
            ))}
        </tbody>
      </table>
      <Button onClick={onSubmit}>{createNew ? "Create" : "Update Info"}</Button>
    </Form>
  );
};

export default AppDetails;

import styled from "styled-components";
const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  td {
    padding: 5px;
  }
  label {
    font-weight: bold;
    display: block;
    text-align: end;
    &:after {
      content: ":";
    }
  }
`;

const Button = styled.div`
  margin: 20px;
  padding: 10px 40px;
  border-radius: 10px;
  border: 1px solid gray;
  cursor: pointer;
`;
