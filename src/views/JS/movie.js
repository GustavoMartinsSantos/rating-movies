function showItems (elementClass, showMoreId) {
    if(showMoreId) {
        var showMoreIcon = document.getElementById(showMoreId)

        if(showMoreIcon.classList.contains("active"))
            showMoreIcon.classList.remove("active")
        else
            showMoreIcon.classList.toggle("active")
    }

    document.querySelectorAll('.' + elementClass).forEach(function (element) {
        if(element.classList.contains("show"))
            element.classList.remove("show")
        else
            element.classList.toggle("show")
    })
}

function showComments (showCommentsDiv) {
    let critic = showCommentsDiv.closest('.critic-section')
    var showMoreIcon = critic.querySelector('.showMoreCommentsIcon')
    var postCommentForm = critic.querySelector('.postCommentForm')

    if(showMoreIcon.classList.contains("active")) {
        showMoreIcon.classList.remove("active")
        postCommentForm.classList.remove("show")
    } else {
        showMoreIcon.classList.toggle("active")
        postCommentForm.classList.toggle("show")
    }

    critic.querySelectorAll('.comment').forEach(function (comment) {
        if(!comment.classList.contains('reply')) {
            if(comment.classList.contains("show"))
                comment.classList.remove("show")
            else
                comment.classList.toggle("show")
        }
    })
}

function showCommentReplies (button) {
    let comment = button.closest('.comment')
    var id = comment.id

    // foreach reply, add show class
    comment.querySelectorAll(`[ref="${id}"]`).forEach(
        (reply) => reply.classList.toggle('show')
    )
}

function addEditCommentForm (button, action) {
    let comment = button.closest('.comment')
    let container = comment.querySelector('.container')
    let description = comment.querySelector('.comment-description')
    let form = comment.querySelector('.editForm')

    if(form == null) {
        container.classList.toggle('border-success')
        button.classList.toggle('text-danger')

        description.innerHTML = 
        `<form class="editForm" onsubmit="sendAjax(this, '${action}', 'PATCH')">
            <textarea name="description" class="input form-control bg-dark text-white border" rows="3" style="resize: none">${description.innerHTML.replace('<br>', '\n')}</textarea>
            <input type="submit" value="Editar" style="float: right" class="mt-2 btn btn-success rounded">
        </form>`
    } else {
        container.classList.remove('border-success')
        button.classList.remove('text-danger')

        description.innerHTML = form.querySelector('.input').innerHTML.replace('\n', '<br>')

        form.remove()
    }
}

function addReplyForm (button, action) {
    let comment = button.closest('.comment')
    let replyDiv = comment.querySelector('.replyOption')
    let form = comment.querySelector('.replyForm')

    if (form == null) {
        replyDiv.classList.toggle('active')

        comment.innerHTML += 
        `<form method="POST" action="${action}" class="p-4 replyForm">
            <textarea name="description" class="form-control" rows="3" style="resize: none"></textarea>
            <input type="hidden" name="parentCommentId" value="${comment.id}">
            <input value="Responder" type="submit" class="rounded border-0 mt-2 text-light bg-primary ml-1" style="width: 15%">
        </form>`
    } else {
        replyDiv.classList.remove('active')
        form.remove()
    }
}