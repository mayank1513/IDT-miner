import { audioRow, albRow } from "types"
import Link from "next/link";

const editableFileds = ['sloka', 'date', 'place', 'video'];
type propType = { a: audioRow | albRow, arteBaseUrl: string, saved: boolean, setSaved: Function, langs: string[][] }

export default function Row({ a, arteBaseUrl, saved, setSaved, langs }: propType) {
    return (
        <RowContainer>
            <td>{a.url.includes('.') ? a.url : <Link href={`${location.pathname}&sls;${a.url}`}><a>{a.url} &#8599;</a></Link>}</td>
            {
                Object.keys(a.labels).map(k => <td key={k}><input type="text" defaultValue={a.labels[k]} onInput={e => {
                    // @ts-ignore
                    a.labels[k] = e.target.value;
                    saved && setSaved(false);
                }} /></td>)
            }
            <td><img src={a.arte ? `${arteBaseUrl}/${a.arte}` : '/logo.png'} alt="" /></td>
            {
                // @ts-ignore
                editableFileds.map(f => (<td key={f}><input type="text" defaultValue={a[f]} onInput={e => {
                    // @ts-ignore
                    a[f] = e.target.value;
                    saved && setSaved(false);
                }} /></td>))
            }
            <td><select defaultValue={a.lang} onChange={e => {
                a.lang = e.target.value;
                saved && setSaved(false);
            }}>
                <option value=""></option>
                {
                    langs.map(l => <option key={l[0]} value={l[0]}>{l[1]}</option>)
                }
            </select></td>
            {
                // @ts-ignore
                a.size && <td>{a.size}</td>
            }
        </RowContainer>
    )
}

import styled from "styled-components"
const RowContainer = styled.tr/*css*/`
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