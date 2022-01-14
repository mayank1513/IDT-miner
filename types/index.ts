export class Info {
    appName: string = ""
    baseUrl: string = ""
    ytBaseUrl: string = ""
    infoUrl: string = ""
    fb: string = ""
    yt: string = ""
    linkedin: string = ""
    twitter: string = ""
    remote: string = ""
    appName_i18n: string = ""
    dir: string = ""
}

export interface albRow {
    url: string,
    labels: string[],
    arte: string,
    date: string,
    lang: number,
    place: string,
}

export interface audioRow {
    url: string,
    labels: string[],
    arte: string,
    sloka: string,
    date: string,
    lang: number,
    place: string,
    size: string
}
