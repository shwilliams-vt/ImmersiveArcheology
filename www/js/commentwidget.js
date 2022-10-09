import submitFormPost from "/js/submitpost.js";
import submitGet from "/js/submitget.js";
import parseTable from "/js/tableparser.js";

function createCommentBox(widget, info) {

    let base = document.createElement("div");
    base.classList.add("comment_base");
    base.style.height = widget.styles.commentHeight;

    console.log(info)

    // Create layers
    base.innerHTML = "\
    <div style='display:flex;justify-content:space-between;height:20px;'>\
        <span><h4 style='margin:0;display:inline;'>"+ info[2] +"</h4> &lt;"+ info[3] +"&gt; said:</span><span>On "+ info[5] +"</span>\
    </div>\
    <div style='padding:10px;background-color:#fff;border:4px solid #ddd;height:calc(100% - 50px)'>"+ info[4] +"</div>\
    ";

    return base;

}

export default class CommentWidget {

    constructor (thread_id) {

        this.thread_id = thread_id;

        this.domElem = document.createElement("div");
        this.domElem.classList.add("comment_wrapper");

        this.styles = {};
        this.styles.commentHeight = "150px";

        this.inputForm = document.createElement("div");
        this.inputForm.style.height = this.styles.commentHeight;
        this.inputForm.classList.add("comment_form");
        this.domElem.appendChild(this.inputForm);

        // Inside input form

        // pseudo-element for thread id
        let pseudo = document.createElement("input");
        pseudo.type = "text";
        pseudo.name = "thread_id";
        pseudo.style.display = "none";
        pseudo.value = this.thread_id;
        this.inputForm.appendChild(pseudo);

        // Holds our user name and email fields
        let firstWrapper = document.createElement("div");
        firstWrapper.classList.add("first_wrapper");
        this.inputForm.appendChild(firstWrapper);

        // Holds our user name (label and text)
        let userNameBox = document.createElement("div");
        userNameBox.classList.add("field_holder");
        firstWrapper.appendChild(userNameBox);

        let nameLabel = document.createElement("p");
        nameLabel.innerHTML = "<b>Your Name:</b>";
        userNameBox.appendChild(nameLabel);
        this.nameField = document.createElement("input");
        this.nameField.type = "text";
        this.nameField.name = "name";
        userNameBox.appendChild(this.nameField);

        // Holds our user email (label and text)
        let userEmailBox = document.createElement("div");
        userEmailBox.classList.add("field_holder");
        firstWrapper.appendChild(userEmailBox);

        let emailLabel = document.createElement("p");
        emailLabel.innerHTML = "<b>Your Email:</b>";
        userEmailBox.appendChild(emailLabel);
        this.emailField = document.createElement("input");
        this.emailField.type = "text";
        this.emailField.name = "email";
        userEmailBox.appendChild(this.emailField);

        // Main comment area
        this.inputText = document.createElement("textarea");
        this.inputText.name = "comment";
        this.inputText.placeholder = "Enter your comment here...";
        this.inputForm.appendChild(this.inputText);

        // Holds submit button and error
        let lastWrapper = document.createElement("div");
        lastWrapper.classList.add("last_wrapper");
        this.inputForm.appendChild(lastWrapper);

        this.inputSubmit = document.createElement("button");
        this.inputSubmit.innerText = "Submit";
        // submit
        this.inputSubmit.addEventListener("click", ()=>this.submit(this));
        lastWrapper.appendChild(this.inputSubmit);

        let errorParagraph = document.createElement("p");
        errorParagraph.style.height = "40%";
        errorParagraph.style.width = "100%";
        lastWrapper.appendChild(errorParagraph);
        this.errorMessage = document.createElement("b");
        this.errorMessage.style.fontSize = "11px";
        this.errorMessage.style.lineHeight = "0px";
        this.errorMessage.style.color = "red";
        errorParagraph.appendChild(this.errorMessage);

        // Add comment section
        this.commentSection = document.createElement("div");
        this.domElem.appendChild(this.commentSection);

        // Load comments initially
        this.reload();
    }

    log(text) {
        this.errorMessage.innerHTML = text;
    }

    submit(scope) {

        if (!scope)
            scope = this;

        submitFormPost(
            "/inc/submit_comment.php", 
            scope.inputForm, 
            (response)=>{
                scope.log(response);
                scope.reload();
            }, 
            (response)=>scope.log(response)
        );
    }

    async reload() {

        let scope = this;

        let result = null;
        console.log(scope.thread_id)

        await new Promise(resolve=>{
            submitGet(
                "/inc/download_comments.php", 
                [{key:"thread_id", value:scope.thread_id}], 
                (response)=>{
                    console.log(response)
                    result = parseTable(response);
                    resolve();
                }, 
                (response)=>{
                    scope.log(response);
                    resolve();
                }
            );
        });

        if (result) {


            // Clear history
            this.commentSection.innerHTML = "";
            
            result.forEach(comment=>{
                this.commentSection.appendChild(createCommentBox(scope, comment));
            })
        }
    }
}