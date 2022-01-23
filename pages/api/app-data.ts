// #todo - add queue mecanism to fetch - no need to use p-limit

import type { NextApiRequest, NextApiResponse } from 'next'
import type { Info } from 'types';

import fs from 'fs';
import path from 'path'

import { albRow } from 'types';
import { audioRow } from 'types';
import { findStem, hari, getRef, touchUp } from '@/utils/index';

import pLimit from 'p-limit';

const albHeaders = ['url', 'labels', 'arte', 'sloka', 'date', 'lang', 'place', 'video', 'lastUpdatTime'];
const audioHeaders = ['url', 'labels', 'arte', 'sloka', 'date', 'lang', 'place', 'video', 'size', 'lastUpdatTime'];

const dataDir = path.join(process.cwd(), "data");
const fileUtils = (() => {
    let _places_: string[] = [];
    let _specialPlaces_: string[] = [];
    let _regex_: [string, string, string][] = [];

    function getPl(file: string, appDir?: string) {
        const dtPlFile = path.join(dataDir, file);
        const plFile = appDir && path.join(appDir, file);
        return [
            ...(plFile && fs.existsSync(plFile) && fs.readFileSync(plFile).toString().split('\n') || []),
            ...fs.readFileSync(path.join(process.cwd(), 'utils', file)).toString().split('\n'),
            ...(fs.existsSync(dtPlFile) && fs.readFileSync(dtPlFile).toString().split('\n') || [])
        ].map(pl => pl.trim()).sort((a, b) => a.length - b.length);
    }

    return {
        getPlaces(appDir?: string) {
            if (!_places_.length) {
                _places_ = getPl('places.txt', appDir);
            }
            return _places_;
        },
        getSpecialPlaces(appDir?: string) {
            if (!_specialPlaces_.length) {
                _specialPlaces_ = getPl('special_places.txt', appDir);
            }
            return _specialPlaces_;
        },
        addPlace(place: string, file: string, appDir?: string) {
            const places = file.includes('special') ? this.getSpecialPlaces(appDir) : this.getPlaces(appDir);
            if (places.map(pl => pl.toLowerCase()).includes(place.trim().toLowerCase())) {
                return 'Place already exists'
            } else {
                const plFile = path.join(appDir || dataDir, file);
                places.push(place.trim());
                places.sort((a, b) => a.length - b.length);
                fs.appendFileSync(plFile, `\n${place.trim()}`);
                return 'Place added.'
            }
        },
        getRx(appDir?: string) {
            if (!_regex_.length) {
                const rFile = appDir && path.join(appDir, 'rx.txt');
                const drFile = path.join(dataDir, 'rx.txt');
                _regex_ = [
                    ...(rFile && fs.existsSync(rFile) && fs.readFileSync(rFile).toString().split('\n') || []),
                    ...(fs.existsSync(drFile) && fs.readFileSync(drFile).toString().split('\n') || [])
                ].filter(r => r.match(/^[^:]+:[^:]*:[ig]{0,2}$/)).map(r => r.split(':')).sort((a, b) => a[0].length - b[0].length) as [string, string, string][];
            }
            return _regex_;
        },
        addRx(rx: [string, string, string], appDir?: string) {
            if (this.getRx(appDir).map(r => r[0]).includes(rx[0])) {
                return `RegExp already Exists! You can edit directly in data directory`
            } else {
                const rxFile = path.join(appDir || dataDir, 'rx.txt');
                fs.appendFileSync(rxFile, `\n${rx.join(':')}`)
                return 'RegExp added!'
            }
        }
    }
})()


function getExistingData({ cDir, info }: { cDir: string, info: Info }) {
    const existingAlbs: albRow[] = [];
    const existingAudios: audioRow[] = [];
    const albumsFile = path.join(cDir, "albums.csv");
    const audiosFile = path.join(cDir, "audios.csv");
    if (fs.existsSync(albumsFile)) {
        const albs = fs.readFileSync(albumsFile).toString().split('\n');
        const stem = albs[0].split(',')[0].trim();
        albs.slice(1).forEach(alb => {
            let [, url, title, arte, sloka, date, lang, place, video, lastUpdatTime] = alb.split(', ');
            if (!url) return;
            url = url.replace(/#/g, stem);
            fs.existsSync(path.join(cDir, url)) && typeof place == 'string' && existingAlbs.push({ url, labels: { en: title }, arte, sloka, date, lang, place, video, lastUpdatTime })
        })
    }

    if (fs.existsSync(audiosFile)) {
        const audios = fs.readFileSync(audiosFile).toString().split('\n');
        const stem = audios[0].split(',')[0].trim();
        audios.slice(1).forEach(a => {
            const [, url, title, arte, sloka, date, lang, place, video, size, lastUpdatTime] = a.split(', ');
            url && typeof size == 'string' && existingAudios.push({ url: url.replace(/#/g, stem), labels: { en: title }, arte, sloka, date, lang, place, video, size, lastUpdatTime })
        })
    }

    Object.keys(info.i18n.labelLangs).filter(l => l !== 'en').forEach(k => {
        const albumsFile = path.join(cDir, `albums_${k}.csv`);
        const audiosFile = path.join(cDir, `audios_${k}.csv`);
        if (fs.existsSync(albumsFile)) {
            const labels = fs.readFileSync(albumsFile).toString().trim();
            labels && existingAlbs.length && labels.split('\n').map((l, i) => existingAlbs[i].labels[k] = l);
        } else {
            existingAlbs.map(alb => {
                alb.labels[k] = '';
                return alb;
            })
        }

        if (fs.existsSync(audiosFile)) {
            const labels = fs.readFileSync(audiosFile).toString().trim();
            labels && existingAudios.length && labels.split('\n').map((l, i) => existingAudios[i].labels[k] = l);
        } else {
            existingAudios.map(a => {
                a.labels[k] = '';
                return a;
            })
        }
    })

    return { existingAlbs, existingAudios }
}

async function scrapeIDT(url: string, parentAlb: string, info: Info): Promise<{ albums: albRow[], audios: audioRow[], tmp: any[] }> {
    const audios: audioRow[] = [];
    const albums: albRow[] = [];
    let tmp: any[] = [];
    try {
        const data = await fetch(url).then(res => res.text());
        const rows = data.split('\n').map((it: string) => it.trim()).filter((it: string) => it.startsWith('<tr><td'));
        tmp = rows.slice(1).map(r => {
            const [, a, d, s,] = r.match(/<td(.*?)>(.*?)<\/td>/g)?.map(td => /<td(.*?)>(.*?)<\/td>/.exec(td)![2].trim()) as string[];
            const url = /<a href=(.*?)>(.*?)<\/a>/.exec(a)![1].replace(/(\"|\/)/g, '');
            let title = hari(decodeURI(url).replace(/_/g, ' ')).split('.')[0];
            if (info.flags.removeParentStr)
                title = title.replace(parentAlb, '');
            const { title_, ...otr } = { ...getRef(title) }
            if (url.match(/.*\.(mp3|wma)$/i)) { // is audio
                audios.push({
                    url,
                    labels: { en: title_ },
                    arte: '',
                    lang: '',
                    size: s,
                    video: '',
                    place: '',
                    ...otr,
                    lastUpdatTime: d
                })
                touchUp(audios, info, fileUtils.getRx(), fileUtils.getPlaces(), fileUtils.getSpecialPlaces(), parentAlb);
            } else if (!url.includes('.')) {
                albums.push({
                    url,
                    labels: { en: title_ },
                    arte: '',
                    lang: '',
                    place: '',
                    ...otr,
                    video: '',
                    lastUpdatTime: d,
                })
                touchUp(albums, info, fileUtils.getRx(), fileUtils.getPlaces(), fileUtils.getSpecialPlaces(), parentAlb);
            }
            return { url, d, s }
        })
    } catch (err) {
        console.log(err);
    }
    return { albums, audios, tmp }
}

function writeData({ cDir, albums, audios, info }: { cDir: string, albums: albRow[], audios: audioRow[], info: Info }) {
    const albStem = findStem(albums.map(a => a.url));
    fs.writeFileSync(path.join(cDir, "albums.csv"), `${albStem},${albHeaders.join(', ')}\n` + albums.map(a => {
        const newAlbDir = path.join(cDir, a.url);
        fs.existsSync(newAlbDir) || fs.mkdirSync(newAlbDir);
        return { ...a, url: a.url.replace(new RegExp(albStem, 'g'), '#') }
        // @ts-ignore
    }).map(alb => albHeaders.reduce((r, c) => `${r}, ${c === 'labels' ? alb[c].en : alb[c]}`, '')).join('\n'));

    const stem = findStem(audios.map(a => a.url));
    // @ts-ignore
    fs.writeFileSync(path.join(cDir, "audios.csv"), `${stem},${audioHeaders.join(', ')}\n` + audios.map(a => ({ ...a, url: a.url.replace(new RegExp(stem, 'g'), '#') })).map(a => audioHeaders.reduce((r, c) => `${r}, ${c === 'labels' ? a[c].en : a[c]}`, '')).join('\n'));

    Object.keys(info.i18n.labelLangs).filter(l => l !== 'en').forEach(k => {
        fs.writeFileSync(path.join(cDir, `albums_${k}.csv`), albums.map(alb => {
            alb.labels[k] = alb.labels[k] || '';
            return alb.labels[k];
        }).join('\n'));

        fs.writeFileSync(path.join(cDir, `audios_${k}.csv`), audios.map(a => {
            a.labels[k] = a.labels[k] || '';
            return a.labels[k];
        }).join('\n'));
    })
}

async function getData(cDir: string, info: Info, appDir: string, update: boolean, parentAlb = '', mxConc = 5) { //mxCon 6 => maxConcarency of 5*4*3*2 = 80 in worst case -- in exceptional case when many subalbums are added and updates in several nested albums it might go beyond
    const baseUrl = info.baseUrl;
    fs.existsSync(cDir) || fs.mkdirSync(cDir);
    const { existingAlbs, existingAudios } = getExistingData({ cDir, info })

    // ========================= Return if not update and prescraped data exists
    if (!update && (existingAlbs.length || existingAudios.length)) {
        return { audios: existingAudios, albums: existingAlbs }
    }

    const url = `${baseUrl}/${cDir.replace(appDir, '')}`//.replace(new RegExp(path.sep, 'g'), '/');
    const { albums, audios, tmp } = await scrapeIDT(url, parentAlb, info);

    let newAudios = 0;
    let newAlbs = 0;
    let updatedAlbs = 0;
    if (!existingAlbs.length && !existingAudios.length) {
        newAlbs = albums.length;
        newAudios = audios.length;
        const limit = pLimit(mxConc);
        mxConc = Math.max(1, mxConc - 1);
        await Promise.all(albums.map(alb => limit(async () => {
            const { updates } = await getData(path.join(cDir, alb.url), info, appDir, update, alb.labels.en, mxConc);
            if (updates) {
                newAudios += updates.newAudios || 0;
                newAlbs += updates.newAlbs || 0;
                updatedAlbs += updates.updatedAlbs || 0;
            }
        })))
        writeData({ cDir, albums, audios, info });
        return { updates: { newAudios, newAlbs, updatedAlbs }, tmp, audios, albums }
    } else {
        if (existingAlbs.length) {
            for (let i = 0; i < albums.length; i++) {
                const alb = albums[i];
                const alb1 = existingAlbs.filter(a => a.url == alb.url)[0];
                if (!alb1 || alb1.lastUpdatTime.trim() !== alb.lastUpdatTime.trim()) {
                    const { updates } = await getData(path.join(cDir, alb.url), info, appDir, update, alb.labels.en, mxConc);
                    if (updates) {
                        newAudios += updates.newAudios || 0;
                        newAlbs += updates.newAlbs || 0;
                        updatedAlbs += updates.updatedAlbs || 0;
                    }
                    if (alb1) {
                        alb1.lastUpdatTime = alb.lastUpdatTime;
                        updatedAlbs++;
                    } else newAlbs++;
                }
                if (alb1) albums[i] = { ...alb1 }
                existingAlbs.splice(existingAlbs.indexOf(alb1), 1);
            }
            // add all existing albums (in some situations we need to add some manually thus those will be there as existing ones)

            for (let i = 0; i < existingAlbs.length; i++) {
                const alb = existingAlbs[i];
                albums.push(existingAlbs[i]);
                const { updates } = await getData(path.join(cDir, alb.url), info, appDir, update, alb.labels.en, mxConc);
                if (updates) {
                    newAudios += updates.newAudios || 0;
                    newAlbs += updates.newAlbs || 0;
                    updatedAlbs += updates.updatedAlbs || 0;
                }
            }
        }
        if (existingAudios.length) {
            for (let i = 0; i < audios.length; i++) {
                const a = existingAudios.filter(a => a.url == audios[i].url)[0];
                if (a) {
                    audios[i] = { ...a };
                    existingAudios.splice(existingAudios.indexOf(a), 1);
                } else {
                    newAudios++;
                }
            }
        }
        writeData({ cDir, albums, audios, info });
        return { updates: { newAudios, newAlbs, updatedAlbs }, audios, albums }
    }
}

function rebuildAlb({ albums, audios, appDir, cDir, info, parentAlb, fromUrl = false }: { albums: albRow[], audios: audioRow[], appDir: string, cDir: string, info: Info, parentAlb: string, fromUrl?: boolean }) {
    touchUp(albums, info, fileUtils.getRx(appDir), fileUtils.getPlaces(appDir), fileUtils.getSpecialPlaces(), parentAlb, fromUrl);
    touchUp(audios, info, fileUtils.getRx(appDir), fileUtils.getPlaces(appDir), fileUtils.getSpecialPlaces(), parentAlb, fromUrl);
    writeData({ cDir, albums, audios, info });
}

function rebuildAll({ albums, audios, appDir, cDir, info, parentAlb, fromUrl = false }: { albums: albRow[], audios: audioRow[], appDir: string, cDir: string, info: Info, parentAlb: string, fromUrl?: boolean }) {
    rebuildAlb({ albums, audios, appDir, cDir, info, parentAlb, fromUrl });
    return Promise.all(albums.map(async a => {
        const { albums, audios } = await getData(path.join(cDir, a.url), info, appDir, false, a.labels.en);
        await rebuildAll({ albums, audios, appDir, cDir: path.join(cDir, a.url), info, parentAlb: a.labels.en, fromUrl })
    }))
}

import { Rebuild, RebuildSubAlbs, RebuildAll, RebuildFromURL, RebuildSubAlbsFromURL, RebuildAllFromURL } from '@/components/Header';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method == 'POST') {
        fs.existsSync(dataDir) || fs.mkdirSync(dataDir);

        const pParts = req.body.path.split('&sls;');
        const appDir = req.body.path && path.join(dataDir, pParts[0]);

        if (req.body.rx) {
            res.json({ msg: fileUtils.addRx(req.body.rx, appDir) })
        } else if (req.body.place) {
            res.json({ msg: fileUtils.addPlace(req.body.place, 'places.txt', appDir) });
        } else if (req.body.specialPlace) {
            res.json({ msg: fileUtils.addPlace(req.body.specialPlace, 'special_places.txt', appDir) });
        } else if (fs.existsSync(appDir) && fs.lstatSync(appDir).isDirectory() &&
            fs.existsSync(path.join(appDir, "info.json"))) {
            const info: Info = JSON.parse(fs.readFileSync(path.join(appDir, "info.json")).toString());
            const cDir = dataDir + path.sep + req.body.path.replace(/&sls;/g, path.sep);

            const pUrl = pParts[pParts.length - 1];
            const parentAlb = !pUrl || cDir == appDir ? '' : (await getData(path.join(appDir, ...pParts.slice(1, pParts.length - 1)), info, appDir, false)).albums.filter(a => a.url == pUrl)[0].labels.en;
            const { audios, albums } = await getData(cDir, info, appDir, false)
            if (req.body.albUrl) {
                const url = req.body.albUrl.toLowerCase().trim();
                if (albums.map(a => a.url.toLowerCase().trim()).includes(url)) {
                    res.json({ msg: 'Album Already Exists!' });
                } else {
                    let title = hari(decodeURI(req.body.albUrl).replace(/_/g, ' ')).split('.')[0];
                    if (info.flags.removeParentStr)
                        title = title.replace(parentAlb, '');
                    const { title_, ...otr } = { ...getRef(title) }
                    albums.push({
                        url: req.body.albUrl,
                        labels: { en: title_ },
                        arte: '',
                        lang: '',
                        place: '',
                        ...otr,
                        video: '',
                        lastUpdatTime: new Date().toDateString(),
                    })
                    touchUp(albums, info, fileUtils.getRx(), fileUtils.getPlaces(), fileUtils.getSpecialPlaces(), parentAlb);
                    writeData({ cDir, albums, audios, info });
                    res.json({ msg: 'Album Added' })
                }
            } else if (req.body.rebuild) {
                switch (req.body.rebuild) {
                    case Rebuild:
                        rebuildAlb({ albums, audios, appDir, cDir, info, parentAlb });
                        break;
                    case RebuildAll:
                        {
                            // @ts-ignore
                            const { audios, albums } = await getData(appDir, info, appDir, false)
                            await rebuildAll({ albums, audios, appDir, cDir: appDir, info, parentAlb: '' })
                        }
                        break;
                    case RebuildSubAlbs:
                        await rebuildAll({ albums, audios, appDir, cDir, info, parentAlb })
                        break;
                    case RebuildFromURL:
                        rebuildAlb({ albums, audios, appDir, cDir, info, parentAlb, fromUrl: true });
                        break;
                    case RebuildSubAlbsFromURL:
                        await rebuildAll({ albums, audios, appDir, cDir, info, parentAlb, fromUrl: true })
                        break;
                    case RebuildAllFromURL:
                        {
                            // @ts-ignore
                            const { audios, albums } = await getData(appDir, info, appDir, false)
                            await rebuildAll({ albums, audios, appDir, cDir: appDir, info, parentAlb: '', fromUrl: true })
                        }
                        break;
                }
                res.status(200).json({ msg: 'Rebuild complete! Please reload the page.' });
            } else if (req.body.audios && req.body.albums) {
                const audios = req.body.audios as audioRow[];
                const albums = req.body.albums as albRow[];
                writeData({ cDir, audios, albums, info });
                res.json({ msg: 'Data Written' });
            } else {
                const r = await getData(cDir, info, appDir, req.body.update);
                res.json({ ...r, info });
            }
        } else {
            res.status(400);
        }
    } else
        res.status(400);
}
