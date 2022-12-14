export default function submitGet(phpLink, terms, onSuccess, onFailure) {

    // 1. Parse GETS
    const data = new URLSearchParams();

    terms.forEach(child=>{
        data.append(child.key, child.value);
    });

    // 2. Submit GET

    fetch(phpLink + "?" + data.toString(), {
        method: 'get'
    }).then(async (res) => {
        let t = await res.text();
        if (res.status == 201 && onSuccess) {
            onSuccess(t);
        } else if (onFailure) {
            onFailure(t);
        }
    }).catch((error) => {
        console.log(error)
    });
}