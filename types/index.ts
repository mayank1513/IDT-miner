export class Info {
    appName = ""
    baseUrl = ""
    ytBaseUrl = ""
    infoUrl = ""
    fb = ""
    yt = ""
    linkedin = ""
    twitter = ""
    remote = ""
    dir = ""
    flags = {
        numbering: false,
        removeParentStr: true
    }
    i18n = {
        titles: {},
        labelLangs: { en: 'English' },
        audioLangs: { en: 'English', vb: 'Vaiṣṇavā Bhajan', hk: 'Hare Kṛṣṇa Kirtan' }
    }
}

export interface albRow {
    url: string,
    labels: any,
    arte: string,
    sloka: string,
    date: string,
    lang: string,
    place: string,
    video: string,
    lastUpdatTime: string
}

export interface audioRow {
    url: string,
    labels: any,
    arte: string,
    sloka: string,
    date: string,
    lang: string,
    place: string,
    video: string,
    size: string,
    lastUpdatTime: string
}
