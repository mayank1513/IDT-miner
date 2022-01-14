// #todo - add queue mecanism to fetch - no need to use p-limit

import type { NextApiRequest, NextApiResponse } from 'next'
import type { Info } from 'types';

import fs from 'fs';
import path from 'path'

import { albRow } from 'types';
import { audioRow } from 'types';
import { findStem, hari, getRef, getPlace } from '@/utils/index';

import pLimit from 'p-limit';

const albHeaders = ['url', 'labels', 'arte', 'date', 'lang', 'place'];
const audioHeaders = ['url', 'labels', 'arte', 'sloka', 'date', 'lang', 'place', 'size'];

function getExistingData({ cDir, albumsFile, audiosFile }: { cDir: string, albumsFile: string, audiosFile: string }) {
    const existingAlbs: albRow[] = [];
    const existingAudios: audioRow[] = [];
    if (fs.existsSync(albumsFile)) {
        const albs = fs.readFileSync(albumsFile).toString().split('\n');
        const stem = albs[0].split(',')[0].trim();
        albs.slice(1).forEach(alb => {
            let [, url, title, arte, date, lang, place] = alb.split(', ');
            if (!url) return;
            url = url.replace(/#/g, stem);
            fs.existsSync(path.join(cDir, url)) && typeof place == 'string' && existingAlbs.push({ url, labels: [title], arte, date, lang: parseInt(lang), place })
        })
    }

    if (fs.existsSync(audiosFile)) {
        const audios = fs.readFileSync(audiosFile).toString().split('\n');
        const stem = audios[0].split(',')[0].trim();
        audios.slice(1).forEach(a => {
            const [, url, title, arte, sloka, date, lang, place, size] = a.split(', ');
            url && typeof size == 'string' && existingAudios.push({ url: url.replace(/#/g, stem), labels: [title], arte, sloka, date, lang: parseInt(lang), place, size })
        })
    }

    return { existingAlbs, existingAudios }
}

async function scrapeIDT(url: string, parentAlb: string): Promise<{ albums: albRow[], audios: audioRow[], tmp: any[] }> {
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
            // Comment this line if don't want to remove parent Alb Name
            title = title.replace(parentAlb, '');
            if (url.match(/.*\..*/)) { // is audio
                const { title_, ...otr } = { ...getRef(title) }
                audios.push({
                    url,
                    labels: [title_],
                    arte: '',
                    lang: -1,
                    size: s,
                    ...otr
                })
            } else {
                const { title_, place } = getPlace(title);
                albums.push({
                    url,
                    labels: [title_],
                    arte: '',
                    date: d,
                    lang: -1,
                    place,
                })
            }
            return { url, d, s }
        })
    } catch (err) {
        console.log(err);
    }
    return { albums, audios, tmp }
}

function writeData({ cDir, albumsFile, audiosFile, albums, audios }: { cDir: string, albumsFile: string, audiosFile: string, albums: albRow[], audios: audioRow[] }) {
    const albStem = findStem(albums.map(a => a.url));
    fs.writeFileSync(albumsFile, `${albStem},${albHeaders.join(', ')}\n` + albums.map(a => {
        const newAlbDir = path.join(cDir, a.url);
        fs.existsSync(newAlbDir) || fs.mkdirSync(newAlbDir);
        return { ...a, url: a.url.replace(new RegExp(albStem, 'g'), '#') }
        // @ts-ignore
    }).map(alb => albHeaders.reduce((r, c) => `${r}, ${alb[c]}`, '')).join('\n'));

    const stem = findStem(audios.map(a => a.url));
    // @ts-ignore
    fs.writeFileSync(audiosFile, `${stem},${audioHeaders.join(', ')}\n` + audios.map(a => ({ ...a, url: a.url.replace(new RegExp(stem, 'g'), '#') })).map(a => audioHeaders.reduce((r, c) => `${r}, ${a[c]}`, '')).join('\n'));
}

async function getData(cDir: string, baseUrl: string, appDir: string, update: boolean, parentAlb = '', mxConc = 5) { //mxCon 6 => maxConcarency of 5*4*3*2 = 80 in worst case -- in exceptional case when many subalbums are added and updates in several nested albums it might go beyond
    fs.existsSync(cDir) || fs.mkdirSync(cDir);
    const albumsFile = path.join(cDir, "albums.csv");
    const audiosFile = path.join(cDir, "audios.csv");

    const { existingAlbs, existingAudios } = getExistingData({ cDir, albumsFile, audiosFile })

    // ========================= Return if not update and prescraped data exists
    if (!update && (existingAlbs.length || existingAudios.length)) {
        return { audios: existingAudios, albums: existingAlbs }
    }

    const url = `${baseUrl}/${cDir.replace(appDir, '')}`//.replace(new RegExp(path.sep, 'g'), '/');
    const { albums, audios, tmp } = await scrapeIDT(url, parentAlb);

    let newAudios = 0;
    let newAlbs = 0;
    let updatedAlbs = 0;
    if (!existingAlbs.length && !existingAudios.length) {
        newAlbs = albums.length;
        newAudios = audios.length;
        const limit = pLimit(mxConc);
        mxConc = Math.max(1, mxConc - 1);
        await Promise.all(albums.map(alb => limit(async () => {
            const { updates } = await getData(path.join(cDir, alb.url), baseUrl, appDir, update, alb.labels[0], mxConc);
            if (updates) {
                newAudios += updates.newAudios || 0;
                newAlbs += updates.newAlbs || 0;
                updatedAlbs += updates.updatedAlbs || 0;
            }
        })))
        writeData({ cDir, albumsFile, audiosFile, albums, audios });
        return { updates: { newAudios, newAlbs, updatedAlbs }, tmp, audios, albums }
    } else {
        if (existingAlbs.length) {
            for (let i = 0; i < albums.length; i++) {
                const alb = albums[i];
                const alb1 = existingAlbs.filter(a => a.url == alb.url)[0];
                if (!alb1 || alb1.date.trim() !== alb.date.trim()) {
                    const { updates } = await getData(path.join(cDir, alb.url), baseUrl, appDir, update, alb.labels[0], mxConc);
                    if (updates) {
                        newAudios += updates.newAudios || 0;
                        newAlbs += updates.newAlbs || 0;
                        updatedAlbs += updates.updatedAlbs || 0;
                    }
                    if (alb1) {
                        alb1.date = alb.date;
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
                const { updates } = await getData(path.join(cDir, alb.url), baseUrl, appDir, update, alb.labels[0], mxConc);
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
        writeData({ cDir, albumsFile, audiosFile, albums, audios });
        return { updates: { newAudios, newAlbs, updatedAlbs }, audios, albums }
    }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method == 'POST') {
        const dataDir = path.join(process.cwd(), "data");
        fs.existsSync(dataDir) || fs.mkdirSync(dataDir);

        const pathParts = req.body.path.split('&sls;');
        const appDir = path.join(dataDir, pathParts[0]);
        if (fs.existsSync(appDir) && fs.lstatSync(appDir).isDirectory() &&
            fs.existsSync(path.join(appDir, "info.json"))) {
            const info: Info = JSON.parse(fs.readFileSync(path.join(appDir, "info.json")).toString());
            const cDir = dataDir + path.sep + req.body.path.replace(/&sls;/g, path.sep);
            const r = await getData(cDir, info.baseUrl, appDir, req.body.update);
            res.json(r);
        } else {
            res.status(400);
        }
    } else
        res.status(400);
}
