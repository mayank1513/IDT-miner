import { audioRow } from "types"

export default function AudioRow({ audio, arteBaseUrl }: { audio: audioRow, arteBaseUrl: string }) {
    return (
        <Audio>
            {
                audio.labels.map(l => <td className="label">{l}</td>)
            }
            <td><img src={audio.arte ? `${arteBaseUrl}/${audio.arte}` : '/logo.png'} alt="" /></td>
            <td>{audio.sloka}</td>
            <td>{audio.date}</td>
            <td>{audio.lang}</td>
            <td>{audio.place}</td>
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
td {
    padding: 5px 10px;
    border: 1px solid gray
}
`