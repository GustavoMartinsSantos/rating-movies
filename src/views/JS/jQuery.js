function sendAjax (uri, method = 'GET', data = null, redirects = false) {
    event.preventDefault()

    $.ajax({
        'url': uri,
        'method': method,
        'data': data
    })

    if(!redirects) // reload to the current page
        location.reload()
    else // redirects to a page
        location.href = redirects
}

function updateDeleteModal (link, title) {
    var onclick = `sendAjax('${link}', 'DELETE')`

    $('#modalTitle').replaceWith(`<p>${title}</p>`)
    $('#confirmDeleteBtn').attr('onclick', onclick)
}