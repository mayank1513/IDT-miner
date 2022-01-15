import { audioRow } from "types"
const editableFileds = ['sloka', 'date', 'place', 'video'];
type propType = { audio: audioRow, arteBaseUrl: string, saved: boolean, setSaved: any }

export default function AudioRow({ audio, arteBaseUrl, saved, setSaved }: propType) {
    return (
        <Audio>
            <td>{audio.url}</td>
            {
                Object.keys(audio.labels).map(k => <td key={k}><input type="text" defaultValue={audio.labels[k]} onInput={e => {
                    // @ts-ignore
                    audio.labels[k] = e.target.value;
                    saved && setSaved(false);
                }} /></td>)
            }
            <td><img src={audio.arte ? `${arteBaseUrl}/${audio.arte}` : '/logo.png'} alt="" /></td>
            {
                // @ts-ignore
                editableFileds.map(f => (<td key={f}><input type="text" defaultValue={audio[f]} onInput={e => {
                    // @ts-ignore
                    audio[f] = e.target.value;
                    saved && setSaved(false);
                }} /></td>))
            }
            <td>{audio.lang}</td>
            <td>{audio.size}</td>
        </Audio>
    )
}

import styled from "styled-components"
const Audio = styled.tr/*css*/`
margin: 5px;
width: 100%;
img {
    max-width: 35px;
}
input {
    padding: 5px 10px;
    border: 1px solid gray;
    width: 100%;
}
td {
    border: 1px solid #5555;
}
`