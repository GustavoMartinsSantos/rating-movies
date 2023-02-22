function sendAjax (uri, method, data = null) {
    event.preventDefault()

    $.ajax({
        'url': uri,
        'method': method,
        'data': data
    })

    location.reload()
}