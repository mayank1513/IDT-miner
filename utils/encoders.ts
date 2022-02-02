const key: boolean[] = [true, false, false, false, true, false, true, true, false, false, true];

export function decodeStr(str: string): string {
    const keyLength = key.length, strLen = str.length;
    let asciiAr = [];
    for (let i = 0; i < strLen; i++) {
        if (key[i % keyLength])
            asciiAr.push(str.charCodeAt(i) + 1);
        else
            asciiAr.push(str.charCodeAt(i) - 1);
    }
    return String.fromCharCode(...asciiAr).replace(/`/g, ",");
}

export function decode(str: string): number {
    if (!str.trim().length) return -1;
    let s = '!'.charCodeAt(0), e = '~'.charCodeAt(0) - 1;
    let k = 0, base = e - s;
    for (let i = 0; i < str.length; i++) {
        k += Math.pow(base, i) * (str.charCodeAt(i) - s);
    }
    return k;
}


export function encodeUrl(str: string): string {
    let asciiAr = [];
    for (let i = 0, j = 0; i < str.length; i++, j++) {
        if (key[j % key.length])
            asciiAr.push(str.charCodeAt(i) - 1);
        else
            asciiAr.push(str.charCodeAt(i) + 1);
    }
    return String.fromCharCode(...asciiAr);
}