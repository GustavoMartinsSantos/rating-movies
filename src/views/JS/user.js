function imagePrev () {
	let image = document.getElementById('image')
	let file = document.getElementById('fileInput').files[0];
	let reader = new FileReader();
	
    reader.onloadend = function () {
        image.setAttribute('src', reader.result)
    }

    if(file)
	    reader.readAsDataURL(file);
}

function confPassword () {
    let passwd     = document.querySelector('input[name=passwd]').value
    let confPasswd = document.getElementById('confPasswd')

    if(passwd != confPasswd.value)
        confPasswd.setCustomValidity('As senhas não conferem')
    else
        confPasswd.setCustomValidity('')
}

function checkEmail () {
    event.preventDefault()
    let form   = document.getElementById('registerForm')
    let email  = document.querySelector('input[name=email]')

    form.setAttribute('action', `./register?email=${encodeURIComponent(email.value)}`)

    form.submit()
}