/*TODO
    - Change load tab to be sign in
    - Finish config for flash message on bad login
    - Delete all test accounts and set up an admin with a better password.
    - Delete console logs on sign up and login
*/

const urlParams = new URLSearchParams(window.location.search)
let skipAnimation = false
if (urlParams.get('err')) {
    skipAnimation = true
    switch (urlParams.get('err')){
        case 'bad-password':
            $('#message').html('Your password is incorrect.')
            break     
        case 'no-user':
            $('#message').html('An account with that username does not exist.')
            break  
        case 'not-approved':
            $('#message').html('Your account is pending approval. Please try again later.')
            break 
        default:
            $('#message').html('Something went wrong.')
            break
    }
}

let tabs = document.querySelectorAll(".credTab")
let labels = document.querySelectorAll(".fieldTitle")
let fields = document.querySelectorAll(".credField")
tabs.forEach((thing, i) => {
    if (i == 0) {
        tabs[1].classList.remove("currentTab")
        tabs[1].style.background = "#444"
        tabs[1].style.color = "#ddd"
        thing.classList.add("currentTab")
        thing.style.color = "#444"
        fields[3].disabled = "true"
        labels[3].disabled = "true"
        fields[3].style.display = "none"
        labels[3].style.display = "none"
        fields[1].disabled = "true"
        labels[1].disabled = "true"
        fields[1].style.display = "none"
        labels[1].style.display = "none"
        $("#credScreen").attr("action", "/login")
        $("#credScreen").attr("onsubmit", "")
    }
})

let bkg = document.querySelector("#bkg")
let cb = bkg.getContext("2d")
window.onload = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = 'Newman Mark 13x10px white.svg';
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    else {
        let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = 'Newman Mark 13x10px.svg';
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    document.body.style.margin = "0"
    bkg.width = document.body.clientWidth
    bkg.height = Math.max(document.body.scrollHeight, window.innerHeight)
    bkg.style.position = "absolute"
    bkg.style.left = 0
    bkg.style.top = 0
    bkg.style.zIndex = -1000
    bkg.style.margin = 0;
    bkg.style.padding = 0;

    cb.fillStyle = "black"
    cb.fillRect(0, 0, bkg.width, bkg.height)
    let ballCount = bkg.width * bkg.height / 20000
    let balls = []
    for (let i = 0; i < ballCount; i++) {
        let newBall = { x: Math.random() * bkg.width, y: Math.random() * bkg.height, vx: Math.random() * 10 - 5, vy: Math.random() * 10 - 5 }
        balls.push(newBall)
    }


    function main(time) {
        update()
        draw()
        setTimeout(() => { requestAnimationFrame(main) }, 15)
    }

    function update() {
        for (ball of balls) {
            ball.x += ball.vx
            ball.y += ball.vy
            if (ball.x > bkg.width) {
                ball.x = 2 * bkg.width - ball.x
                ball.vx = -Math.abs(ball.vx)
            }
            if (ball.y > bkg.height) {
                ball.y = 2 * bkg.height - ball.y
                ball.vy = -Math.abs(ball.vy)
            }
            if (ball.x < 0) {
                ball.x = - ball.x
                ball.vx = Math.abs(ball.vx)
            }
            if (ball.y < 0) {
                ball.y = - ball.y
                ball.vy = Math.abs(ball.vy)
            }
        }
    }
    function draw() {
        cb.beginPath()
        cb.fillStyle = "black"
        cb.rect(0, 0, bkg.width, bkg.height)
        cb.fill()
        /*for (ball of balls){
            cb.beginPath()
            cb.arc(ball.x,ball.y,10,0,2*Math.PI)
            cb.fillStyle = "white"
            cb.fill()
        }*/
        let cells = 24
        let cellw = bkg.width / cells
        let cellh = bkg.height / cells
        for (let i = 0; i <= cells; i++) {
            for (let j = 0; j <= cells; j++) {
                let val = 0
                for (ball of balls) {
                    let d2 = Math.pow(ball.x - cellw * (j + 1 / 2), 2) + Math.pow(ball.y - cellh * (i + 1 / 2), 2)
                    if (d2 < 10000) {
                        val += 1 / 8 - d2 / 80000
                    }
                }
                cb.beginPath()
                cb.rect(cellw * j, cellh * i, cellw, cellh)
                cb.fillStyle = "hsl(0,0%," + parseInt(val * 100) + "%)"
                cb.fill()
            }
        }
    }

    requestAnimationFrame(main)

    if (!skipAnimation){
        const pageTitle = document.querySelector("h1")
        pageTitle.style.opacity = 0

        const square = document.querySelector('#credScreen');
        square.style.marginTop = "80px"
        square.style.opacity = 0

        setTimeout(() => {
            pageTitle.style.transition = ".75s ease-out";
            square.style.transition = "1.5s ease-out";
        }, 50)

        setTimeout(() => {
            pageTitle.style.opacity = 1
            setTimeout(() => {
                square.style.opacity = 1
                square.style.marginTop = "0px"
            }, 600)
        }, 500)
    }

    fields.forEach((item, i) => {
        item.onfocus = (e) => {
            labels[i].style.fontSize = "1.08rem"
            labels[i].style.color = "royalblue"
        }
        item.onblur = (e) => {
            labels[i].style.fontSize = ".85rem"
            labels[i].style.color = "#444"
        }
    })

    let clickX = 0
    let clickY = 0
    tabs.forEach((thing, i) => {
        thing.onclick = (e) => {
            if (thing.classList.contains("currentTab")) {

            } else {
                if (i == 0) {
                    tabs[1].classList.remove("currentTab")
                    tabs[1].style.background = "#444"
                    tabs[1].style.color = "#ddd"
                    thing.classList.add("currentTab")
                    thing.style.color = "#444"
                    fields[3].disabled = "true"
                    labels[3].disabled = "true"
                    fields[3].style.display = "none"
                    labels[3].style.display = "none"
                    fields[1].disabled = "true"
                    labels[1].disabled = "true"
                    fields[1].style.display = "none"
                    labels[1].style.display = "none"
                    $("#credScreen").attr("action", "/login")
                    $("#credScreen").attr("onsubmit", "")
                    $("#message").html('')
                }
                else {
                    tabs[0].classList.remove("currentTab")
                    tabs[0].style.background = "#444"
                    tabs[0].style.color = "#ddd"
                    thing.classList.add("currentTab")
                    thing.style.color = "#444"
                    fields[3].removeAttribute("disabled")
                    labels[3].removeAttribute("disabled")
                    fields[3].style.display = "block"
                    labels[3].style.display = "block"
                    fields[1].removeAttribute("disabled")
                    labels[1].removeAttribute("disabled")
                    fields[1].style.display = "block"
                    labels[1].style.display = "block"
                    $("#credScreen").attr("action", "/register")
                    $("#credScreen").attr("onsubmit", "return validate()")
                    $("#message").html('')
                }
                clickX = e.pageX - e.target.offsetLeft
                clickY = e.pageY - e.target.offsetTop
                popGrad(thing, 1)
            }
        }
    })



    function popGrad(thing, rad) {
        thing.style.background = "radial-gradient( circle at " + clickX + "px " + clickY + "px,#ddd 0%,#ddd " + rad + "%,#444 " + (rad + .5) + "%, #444 101%)"
        //console.log(rad)
        if (rad < 99.9) setTimeout(function () { popGrad(thing, rad * (1 + (100 - rad) / 400)) }, 1)
        //else console.log(rad, "break")
    }

}

function validate() {
    let valid = false
    let messageDiv = document.getElementById('message')
    let form = document.forms.credScreen
    if (form.username.value == '' || form.username.value.length > 18) {
        messageDiv.innerHTML = 'Username must be between 1 and 18 characters.'
        return false
    }
    if (form.password.value.length < 8 || form.password.value.length > 50 || !(/\d/).test(form.password.value) || !(/[a-zA-Z]/).test(form.password.value)) {
        messageDiv.innerHTML = 'Password must be at least 8 characters and must include a number and a letter.'
        return false
    }
    if (form.password.value !== form.password2.value) {
        messageDiv.innerHTML = 'The passwords do not match.'
        return false
    }
    //if the username is taken, reject
    $.ajax({
        url: '/username',
        type: "POST",
        data: JSON.stringify({ username: form.username.value }),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
    }).then(valid => {
        if (valid == false) {
            messageDiv.innerHTML = 'That username is taken.'
            return //this returns false for the NESTED FUNCTION, not the parent. we use a simple flag to work around this.
        }
        //all checks passed.
        valid = true
    }).then(() => {
        return valid
    })

}