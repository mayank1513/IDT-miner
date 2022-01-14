import type { NextApiRequest, NextApiResponse } from 'next'
import type { Info } from 'types';

import fs from 'fs';
import path from 'path'

export default (req: NextApiRequest, res: NextApiResponse) => {
    const dataDir = path.join(process.cwd(), "data");
    fs.existsSync(dataDir) || fs.mkdirSync(dataDir);

    if (req.method == 'POST') {
        const info: Info = req.body.info;
        let [remote, dir] = [
            info.remote.trim(),
            encodeURI(info.appName.trim().replace(/ /g, "-")),
        ];
        if (remote.startsWith("https://")) {
            dir = remote
                .replace("https://", "")
                .replace(".git", "")
                .replace(/(\/|\.)/g, "-")
                .trim();
        }

        if (req.body.createNew) {
            info.dir = dir;
            const appDir = path.join(dataDir, info.dir);
            if (fs.existsSync(appDir)) {
                res.status(503).json({ err: "Directory Already Exists" });
            } else {
                fs.mkdirSync(appDir);
                fs.writeFileSync(path.join(appDir, 'info.json'), JSON.stringify(info));
                res.status(200).json({ info: "Project Created" })
            }
        } else {
            if (info.dir != dir && !fs.existsSync(dir)) {
                fs.renameSync(path.join(dataDir, info.dir), path.join(dataDir, dir));
                info.dir = dir;
            }
            const appDir = path.join(dataDir, info.dir);
            fs.writeFileSync(path.join(appDir, 'info.json'), JSON.stringify(info));
            res.status(200).json({ info: "Project Updated" })
        }
    } else if (req.method == 'DELETE') {
        fs.rmSync(path.join(path.join(dataDir, req.body.dir)), { recursive: true, force: true });
        res.status(200).json({ info: "Project Deleted" })
    } else
        res.status(400);
}