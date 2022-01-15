import { albRow } from "types"
import Link from "next/link"

type propType = { album: albRow, arteBaseUrl: string, saved: boolean, setSaved: any }
export default function AlbRow({ album, arteBaseUrl, saved, setSaved }: propType) {
    return (
        <Alb>
            <td>
                <Link href={`${location.pathname}&sls;${album.url}`}><a>{album.url} &#8599;</a></Link>
            </td>
            {
                Object.keys(album.labels).map(k => <td key={k}><input type="text" defaultValue={album.labels[k]} onInput={e => {
                    // @ts-ignore
                    album.labels[k] = e.target.value;
                    saved && setSaved(false)
                }} /></td>)
            }
            <td><img src={album.arte ? `${arteBaseUrl}/${album.arte}` : '/logo.png'} alt="" /></td>
            <td>{album.date}</td>
            <td><input type="text" defaultValue={album.place} onInput={e => {
                // @ts-ignore
                album.place = e.target.value;
                saved && setSaved(false)
            }} /></td>
            <td>{album.lang}</td>
        </Alb>
    )
}

import styled from "styled-components"
const Alb = styled.tr/*css*/`
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
