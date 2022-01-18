import type { NextApiRequest, NextApiResponse } from 'next'

import fs from "fs";
import path from "path";

export default (_req: NextApiRequest, res: NextApiResponse) => {
    const dataDir = path.join(process.cwd(), "data");
    fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
    const apps = fs
        .readdirSync(dataDir)
        .filter(
            (it) =>
                fs.lstatSync(path.join(dataDir, it)).isDirectory() &&
                fs.existsSync(path.join(dataDir, it, "info.json"))
        )
        .map((appDir) => ({ ...JSON.parse(fs.readFileSync(path.join(dataDir, appDir, "info.json")).toString()), dir: appDir }));

    res.status(200).json(apps);
}