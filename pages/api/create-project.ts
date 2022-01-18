import type { NextApiRequest, NextApiResponse } from 'next'
import type { Info } from 'types';

import fs from 'fs';
import path from 'path'
import { exec } from "child_process"

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const dataDir = path.join(process.cwd(), "data");
    fs.existsSync(dataDir) || fs.mkdirSync(dataDir);

    if (req.method == 'POST') {
        const info: Info = req.body.info;
        const [remote, dir] = [
            info.remote.trim(),
            encodeURI(info.appName.trim().replace(/ /g, "-")),
        ];
        // This creates too long name that is not allowed
        // if (remote.startsWith("https://")) {
        //     dir = remote
        //         .replace("https://", "")
        //         .replace(".git", "")
        //         .replace(/(\/|\.)/g, "-")
        //         .trim();
        // }

        if (req.body.createNew) {
            info.dir = dir;
            if (remote.startsWith("https://")) {
                const msg = await new Promise((rs, _rj) => {
                    exec(`git clone ${remote} ${path.join(process.cwd(), 'data', dir)}`,
                        (error, _stdout, stderr) => {
                            if (error) {
                                rs({ error })
                            } else if (stderr) {
                                rs({ stderr })
                            } else {
                                rs("Project Created")
                            }
                        });
                });
                const infoFile = path.join(dataDir, dir, "info.json");
                if (fs.existsSync(infoFile)) {
                    const info1 = JSON.parse(fs.readFileSync(infoFile).toString())
                    if (remote !== info1.remote) {
                        fs.writeFileSync(infoFile, JSON.stringify({ ...info1, remote }))
                    }
                } else {
                    const { dir, ...otr } = info;
                    fs.writeFileSync(infoFile, JSON.stringify(otr));
                }
                res.status(200).json({ msg })
            } else {
                const appDir = path.join(dataDir, info.dir);
                if (fs.existsSync(appDir) && fs.existsSync(path.join(appDir, 'info.json'))) {
                    res.status(503).json({ err: "App Already Exists" });
                } else {
                    fs.existsSync(appDir) || fs.mkdirSync(appDir);
                    const { dir, ...otr } = info;
                    fs.writeFileSync(path.join(appDir, 'info.json'), JSON.stringify(otr));
                    res.status(200).json({ info: "Project Created" })
                }
            }
        } else {
            const appDir = path.join(dataDir, info.dir);
            const { dir, ...otr } = info;
            fs.writeFileSync(path.join(appDir, 'info.json'), JSON.stringify(otr));
            res.status(200).json({ info: "Project Updated" })
        }
    } else if (req.method == 'DELETE') {
        fs.rmSync(path.join(path.join(dataDir, req.body.dir)), { recursive: true, force: true });
        res.status(200).json({ info: "Project Deleted" })
    } else
        res.status(400);
}