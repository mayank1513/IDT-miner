import { albRow } from "types"
import Link from "next/link"

export default function AlbRow({ album, arteBaseUrl }: { album: albRow, arteBaseUrl: string }) {
    return (
        <Alb>
            <td>
                <Link href={`${location.pathname}&sls;${album.url}`}><a>&#8599;</a></Link>
            </td>
            {
                album.labels.map(l => <td className="label">{l}</td>)
            }
            <td><img src={album.arte ? `${arteBaseUrl}/${album.arte}` : '/logo.png'} alt="" /></td>
            <td>{album.date}</td>
            <td>{album.lang}</td>
            <td>{album.place}</td>
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
td {
    padding: 5px 10px;
    border: 1px solid gray
}
`
