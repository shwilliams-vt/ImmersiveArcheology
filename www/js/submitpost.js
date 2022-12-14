export default function submitFormPost(phpLink, form, onSuccess, onFailure) {

    // 1. Parse form
    // console.log(form)
    const data = new FormData();

    Array.from(form.getElementsByTagName("*")).forEach(child=>{
        // Check if it's an input (TODO add more valid types)

        if (child.tagName.toLowerCase() == "input") {

            if (child.type == "text") {
                data.append(child.name, child.value);
            }
            else if (child.type == "date") {
                data.append(child.name, child.value);
            }
            else if (child.type == "file") {
                data.append(child.name, child.files[0]);
            }
        }
        else if (child.tagName.toLowerCase() == "textarea") {
            data.append(child.name, child.value);
        }
    });

    // 2. Submit POST
    fetch(phpLink, {
        method: 'post',
        body: data
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