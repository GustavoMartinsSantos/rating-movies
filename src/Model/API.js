class API {
    url

    async request () {
        return fetch(this.url)
        .then(response => response.json())
        .then(data => data)
        .catch(err => console.log(err));
    }

    constructor(url) {
        this.url = url
    }
}

module.exports = API