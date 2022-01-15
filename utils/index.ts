export function findStem(urls: string[], stm?: string) {
    stm && (urls = urls.map(url => url.replace(/#/g, stm)));
    const n = urls.length;
    if (n < 2) return ''
    let s = urls[1];
    let len = s.length;

    let res = "";

    for (let i = 0; i < len; i++) {
        for (let j = i + 1; j <= len; j++) {
            // generating all possible substrings
            // of our reference string arr[0] i.e s
            let stem = s.substring(i, j);
            let k;

            for (k = 2; k < n; k++)
                if (!urls[k].includes(stem))
                    break;
            // If current substring is present in
            // all strings and its length is greater
            // than current result
            if (k == n && res.length < stem.length)
                res = stem;
        }
    }
    return res;
}

export function hari(title_: string) {
    title_ = (" " + title_ + " ").replace(/Gita/g, "Gītā")
        .replace(/(Srimad|Shrimad)/ig, "Śrīmad")
        .replace(/Bhagavat(h)?(am|a)?/g, "Bhāgavatam")
        .replace(/Chaitanya/g, "Caitanya")
        .replace(/ Lila/ig, " Līlā")
        .replace(/ Adi/ig, " Ādī")
        .replace(/CC A /ig, "CC Ādī ")
        .replace(/CC M /ig, "CC Madhya ")
        .replace(/Chapter[\s-]?0?/g, "Chapter ")
        .replace(/Canto[\s-]?0?/g, "Canto ")
        .replace(/ Ar(a)?ti/ig, " Ārati")
        .replace(/(Krishna|Krsna)/ig, "Kṛṣṇa")
        .replace(/Vr(i)?ndavan(a)?/ig, "Vṛndāvana")
        .replace(/Radha/g, "Rādhā")
        .replace(/Jayapataka/g, "Jayapatākā")
        .replace(/(Rasamrit(a)?)/g, "Rasāmṛta")
        .replace(/(Radheyshyam)/g, "Rādheyshyam")
        .replace(/(Gopinath)/g, "Gopināth")
        .replace(/(Swami)/g, "Swāmi")
        .replace(/(Prabhupada)/g, "Prabhupāda")
        .replace(/vais(h)?nav(a)?/g, "vaiṣṇava")
        .replace(/Vais(h)?nav(a)?/g, "Vaiṣṇava")
        .replace(/vedant(a)?/g, "vedānta")
        .replace(/Sri/g, "Śrī")
        .replace(/prer(a)?na/ig, "Preraṇa")
        .replace(/chet(a)?na/ig, "Chetana")
        .replace(/is(h)?opanis(h)?ad(a)?/ig, "Īśopaniṣada")
        .replace(/%20|%e2|%80|%|%93|'|=/g, " ")
        .replace(/ BOM /g, " Bombay ")
        .replace(/ HON /g, " Honolulu ")
        .replace(/ LA /g, " Los Angeles ")
        .replace(/ MAY /g, " Mayapur ")
        .replace(/ DAL /g, " Dallas ")
        .replace(/ MEL /g, " Melbourne ")
        .replace(/ GOR /g, " Gorakhpur ")
        .replace(/ SF /g, " San Francisco ")
        .replace(/ NDEL /g, " New Delhi ")
        .replace(/ TOK /g, " Tokyo ")
        .replace(/ AHM /g, " Ahmedabad ")
        .replace(/ ALI /g, " Aligarh ")
        .replace(/ ATL /g, " Atlanta ")
        .replace(/ AUC /g, " Auckland ")
        .replace(/ CHA /g, " Chandigarh ")
        .replace(/ COL /g, " Columbus ")
        .replace(/ HYD /g, " Hyderabad ")
        .replace(/ LON /g, " London ")
        .replace(/ MEX /g, " Mexico ")
        .replace(/ DEN /g, " Denver ")
        .replace(/ DET /g, " Detroit ")
        .replace(/ VRN /g, " Vṛndāvana ")
        .replace(/Addr Addr/g, "Address")
        .replace(/ (Arrival|Arr) (A2|AD|AR) /g, " Arrival Address ")
        .replace(/ Departure (DP|Address) /g, " Arrival Address ")
        .replace(/C(h)?arit(h)?amr(i)?(tha|ta|t)/g, "Caritāmṛta")
        .replace(/IDesireTree/g, '').replace(/Radhanath Sw /g, '')
        .replace(/ +/g, ' ').trim();

    if (title_.replace("Śrīmad Bhāgavatam", "").includes("Śrīmad Bhāgavatam"))
        title_ = title_.replace("Śrīmad Bhāgavatam", "");
    return title_;
}

// const dateFormats = ["yyyy-MM-dd", "dd-MM-yyyy", "yy-MM-dd"/*, "dd-MM-yy"*/, "MM-yyyy", "yyyy-MM", "yyyy"]
const datePatterns = [/\d{4}-\d{1,2}-\d{1,2}/, /\d{1,2}-\d{1,2}-\d{4}/, /\d{1,2}-\d{1,2}-\d{1,2}/, /\d{1,2}-\d{4}/, /\d{4}-\d{1,2}/, /\d{4}/]

function getDate(title_: string): { title_: string, date: string, place: string } {
    let res = { title_, date: '' }
    datePatterns.some(p => {
        const m = title_.match(p);
        if (m && m[0]) {
            res = { title_: title_.replace(m[0], ''), date: m[0] }
            return true;
        }
    })
    return { ...res, ...getPlace(res.title_) };
}

import places from '@/utils/places.json';
import specialPlaces from '@/utils/special_places.json';

export function getPlace(title_: string): { title_: string, place: string } {
    let t = ` ${title_} `;
    let p1 = '';
    let p2 = '';
    let place = '';

    places.some(place_ => {
        let p = ` ${place_}`.toLowerCase()
        if (t.toLowerCase().includes(("iskcon" + p))) {
            p2 = ("ISKCON" + p).trim();
        } else if (t.toLowerCase().replace(/-/g, " ").includes(p)) {
            if (specialPlaces.includes(place_)) {
                t = t.replace(new RegExp(p, 'gi'), "");
                p1 = p.trim();
            } else {
                p2 = p.trim();
                return true;
            }
        }
    })

    let p = '';
    if (p2.length)
        p = p2;
    else if (p1.length)
        p = p1;

    if (p.length) {
        place = p.split(' ').map(it => it.charAt(0).toUpperCase() + it.substring(1)).join(' ');
        if (p2.length) {
            title_ = title_.replace(new RegExp(p2, 'i'), "")
                .replace(/ +/, " ").trim();
        }
    }
    return { title_, place }
}


const ch = "( reading)?[\\s\\-](chapter|ch)?[\\s\\-]?\\d{1,2}",
    txt = "([\\s\\-]|[\\s\\-]?(text|vers(e)?)[\\s\\-]?)\\d{1,2}",
    cc_txt = "([\\s\\-]|[\\s\\-]?text[\\s\\-]?)\\d{1,3}",
    to = "([\\s\\-]?to[\\s\\-]?|[\\s\\-])?",
    bg = "(bg|(bhagavad)?(-|\\s)gītā|^gītā )",
    canto = "[\\s\\-](canto)?[\\s\\-]?\\d{1,2}",
    sb = "(sb|(śrīmad )?bhāgavatam)",
    cc = "(cc|(śrī )?caitanya caritāmṛta)",
    lila = "[\\s\\-]?(((ādī|antya|madhya)([\\s\\-]?līlā)?)|al|ml)[\\s\\-]?",
    nod = "(nod|nectar of devotion)",
    noi = "(noi|nectar of instruction(s)?)",
    mantra = "([\\s\\-]|[\\s\\-]?(text|mantra)[\\s\\-]?)\\d{1,2}",
    iso = "((śrī )?īśopaniṣad(a)?|iso)",
    kb = "(kṛṣṇa book( dict)?|kb)";

const bookParsers = [
    //            Bhagavad Gita
    bg + ch + txt + to + bg + "?" + ch + txt,
    bg + ch + txt + to + txt,
    bg + ch + txt,
    bg + ch,
    bg,
    //            Srimad Bhagavatam
    sb + canto + ch + txt + to + sb + "?" + canto + ch + txt,
    sb + canto + ch + txt + to + ch + txt,
    sb + canto + ch + txt + to + txt,
    sb + canto + ch + txt,
    sb + canto + ch,
    sb + canto,
    sb,
    //            cc
    cc + lila + ch + cc_txt + to + cc + "?" + lila + "?" + ch + cc_txt,
    cc + lila + ch + cc_txt + to + ch + cc_txt,
    cc + lila + ch + cc_txt + to + cc_txt,
    cc + lila + ch + cc_txt,
    cc + lila + ch,
    cc + lila,
    cc,
    //            nod
    nod + ch + to + ch,
    nod + ch,
    nod,
    //            noi
    noi + txt + to + txt,
    noi + txt,
    noi,
    //            iso
    iso + mantra + to + mantra,
    iso + mantra,
    iso,
    //            kb
    kb + ch,
    kb
];

const bookPatterns = bookParsers.map(p => new RegExp(p, 'i'));

import layrics from '@/utils/lyrics.json';

export function getRef(title_: string): { title_: string, sloka: string, date: string, place: string } {
    let res = {
        title_: '',
        sloka: '',
        date: '',
        place: ''
    };

    // try to get book and sloka
    bookPatterns.every((p) => {
        let m = title_.match(p);
        if (m && m[0]) {
            const sloka = m[0].toLowerCase()
                .replace(/(canto|chapter|ch|text|to|līlā|lila|mantra|reading)/g, " ")
                .replace(/(bhagavad([\\-\\s])*)?gītā/g, "bg")
                .replace(/(śrīmad[\\-\\s]?)?bhāgavatam/g, "sb")
                .replace(/(śrī([\\-\\s])*)?caitanya caritāmṛta/g, "cc")
                .replace(/(al|ādī)/g, "adi")
                .replace(/kṛṣṇa book([\\-\\s]*dict)?/g, "kb")
                .replace(/ml/g, "madhya")
                .replace(/nectar of devotion/g, "nod")
                .replace(/nectar of instruction(s)?/g, "noi")
                .replace(/(śrī )?īśopaniṣad(a)?/g, "iso")
                .replace(/ +- +/g, '-').trim()
                .replace(/(\s+|-)/g, ".")
                .split(".").map(it => {
                    const n = parseInt(it);
                    return isNaN(n) ? it : n
                }).join('.');

            const r = m[0].replace(/(canto|chapter|ch|text|to|līlā|mantra|(bhagavad )?gītā|(śrīmad)? bhāgavatam|(śrī)? caitanya caritāmṛta|nectar of (devotion|instruction(s)?)|(śrī)? īśopaniṣada)/ig, '').trim();
            title_ = title_.replace(r, "").replace(/ +/, ' ').trim();
            res = { ...res, title_, sloka }
            return false;
        }
        return true;
    })

    // try to get bhajan if not book and sloka
    if (!res.sloka) {
        title_ = title_.replace(/Jaye |Jay /, "Jaya ")
            .replace(/Radhe(y)?/, "Rādhe")
            .replace(/naam(a)?/, "nāma")
            .replace(/Pra(a)?n(a)?/, "prāṇa")
            .replace(/pra(a)?n(a)?/, "Prāṇa")
            .replace(/Kundala/, "Kuṇḍala")
            .replace(/Jinka/i, "Jinaka")
            .replace(/Vis(h)?al(a)?/, "Viśāla")
            .replace(/Yas(h)?omati/i, "Yaśomatī")
            .replace(/sunder(a)?/i, "Sundara")
            .replace(/vi(ba)?bha[vb](a)?ri(\\s)?s(h)?es(ha|a)?/i, "Vibhavari Śeṣa");

        let sloka = ''
        layrics.some(l => {
            const t = l.title.toLowerCase();
            let s = title_.toLowerCase().replace(/[0-9\-]+/g, "").replace(/(krishna|krsna)/, "kṛṣṇa");
            let s1 = t.replace(/a /, " ").replace(/a$/, "");
            let s2 = s.replace(/a /, " ").replace(/a$/, "").trim();
            if (s.match(new RegExp(".*" + t.replace(/śrī ?/, "").trim() + ".*"))
                || t.includes(s.trim())
                || s2.match(new RegExp(".*" + s1.replace(/śrī ?/, "").trim() + ".*"))
                || s1.includes(s2)) {
                sloka = `vb.${layrics.indexOf(l)}`;
                return true;
            }
        })
        res = { ...res, title_, sloka }
    }
    return { ...res, ...getDate(res.title_) };
}

export function getLang(title: string, l: any) {
    let lang = '';
    Object.keys(l).some(k => {
        const m = title.match(new RegExp(l[k], 'i'));
        if (m && m[0]) {
            title = title.replace(m[0], '');
            lang = k;
            return true;
        }
    })
    return { title, lang }
}