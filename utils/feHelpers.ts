export function postAppData(body: any) {
    return fetch('/api/app-data', {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    }).then(res => res.json())
}