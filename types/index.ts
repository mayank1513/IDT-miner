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
    date: string,
    lang: string,
    place: string,
}

export interface audioRow {
    url: string,
    labels: any,
    arte: string,
    sloka: string,
    date: string,
    lang: string,
    place: string,
    size: string,
    video: string
}
