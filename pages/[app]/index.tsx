import { useRouter } from "next/router";
import { useEffect, useReducer, useState } from "react";
import { albRow, audioRow } from "types";
import Row from "@/components/Row";
import Loader from "@/components/Loader";
import { postAppData } from "@/utils/feHelpers";

type stateType = { albums: albRow[], audios: audioRow[], langs: string[][], audioLangs: string[][] }
const reducer = (_state: stateType, action: stateType) => {
  return action;
}
function onBeforeUnload(e: Event) {
  // if (!saved) {
  e = e || window.event;
  const msg = `You have not saved your data. Your data will be loast if you don't save.`;
  console.log(msg);
  if (e) {
    e.preventDefault();
    e.returnValue = true;
  }
  return msg;
  // }
}

export default function App() {
  const router = useRouter();
  const [{ albums, audios, langs, audioLangs }, setState] = useReducer(reducer, { albums: [], audios: [], langs: [], audioLangs: [] });
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    // check for folders.dat and files.csv
    const path = router.query.app;
    if (!path) return;
    postAppData({
      path,
      update: true
    }).then(data => {
      setState({
        albums: data.albums,
        audios: data.audios,
        langs: Object.entries(data.info.i18n.labelLangs),
        audioLangs: Object.entries(data.info.i18n.audioLangs),
      })
      setSaved(true);
      setLoaderVisible(false);
    })
  }, [router.query])

  useEffect(() => {
    const handleRouteChanges = (url: string) => {
      if (router.pathname !== url && !confirm(`You have not saved your data. Your data will be loast if you don't save.`)) {
        router.events.emit('routeChangeError');
        throw 'Unsaved Chnages'
      }
    }
    if (saved) {
      router.events.off("beforeHistoryChange", handleRouteChanges)
      window.removeEventListener('beforeunload', onBeforeUnload);
    } else {
      router.events.on("beforeHistoryChange", handleRouteChanges)
      window.addEventListener('beforeunload', onBeforeUnload)
    }

    // window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      router.events.off("beforeHistoryChange", handleRouteChanges)
    }
  }, [saved])

  return (
    <Container>
      <button disabled={saved} className="btn" onClick={() => {
        if (saved) return;
        setLoaderVisible(true);
        postAppData({
          path: router.query.app,
          audios,
          albums
        }).then(data => {
          console.log(data);
          setLoaderVisible(false);
          setSaved(true);
        })
      }}>Save</button>
      {
        albums.length != 0 && (
          <>
            <h1>Albums</h1>
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  {
                    langs.map(l => <th key={l[0]}>{`${l[1]} Title`}</th>)
                  }
                  {
                    ['Arte', 'Sloka', 'Date', 'Place', 'Video Playlist', 'Lang'].map(it => <th key={it}>{it}</th>)
                  }
                </tr>
              </thead>
              <tbody>
                {
                  albums.map(a => <Row key={a.url} saved={saved} setSaved={setSaved} a={a} arteBaseUrl="" langs={audioLangs} />)
                }
              </tbody>
            </table>
          </>
        )
      }
      {
        audios.length != 0 && (
          <>
            <h1>Audios</h1>
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  {
                    langs.map(l => <th key={l[0]}>{`${l[1]} Title`}</th>)
                  }
                  {
                    ['Arte', 'Sloka', 'Date', 'Place', 'Video', 'Lang', 'Size'].map(it => <th key={it}>{it}</th>)
                  }
                </tr>
              </thead>
              <tbody>
                {
                  audios.map(a => <Row key={a.url} saved={saved} setSaved={setSaved} a={a} arteBaseUrl="" langs={audioLangs} />)
                }
              </tbody>
            </table>
          </>
        )
      }
      {
        loaderVisible && <Loader message="Loading..." />
      }
    </Container>
  );
}

import styled from "styled-components";
const Container = styled.div/*css */`
max-width: 1400px;
margin: auto;
table {
  margin: 20px;
  width: 100%;
}
.btn {
  float: right;
}
`