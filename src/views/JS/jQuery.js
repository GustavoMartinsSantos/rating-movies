function sendAjax (uri, method, data = null, redirects = false) {
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