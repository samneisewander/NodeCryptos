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


    let labels = document.querySelectorAll(".fieldTitle")
    let fields = document.querySelectorAll(".credField")
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
    let ct = document.querySelector(".currentTab")
    let tabs = document.querySelectorAll(".credTab")
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
                    fields[2].disabled = "true"
                    labels[2].disabled = "true"
                    fields[2].style.opacity = 0
                    labels[2].style.opacity = 0
                }
                else {
                    tabs[0].classList.remove("currentTab")
                    tabs[0].style.background = "#444"
                    tabs[0].style.color = "#ddd"
                    thing.classList.add("currentTab")
                    thing.style.color = "#444"
                    fields[2].removeAttribute("disabled")
                    labels[2].removeAttribute("disabled")
                    fields[2].style.opacity = 1
                    labels[2].style.opacity = 1
                }
                clickX = e.pageX - e.target.offsetLeft
                clickY = e.pageY - e.target.offsetTop
                popGrad(thing, 1)
            }
        }
    })



    function popGrad(thing, rad) {
        thing.style.background = "radial-gradient( circle at " + clickX + "px " + clickY + "px,#ddd 0%,#ddd " + rad + "%,#444 " + (rad + .5) + "%, #444 101%)"
        console.log(rad)
        if (rad < 99.9) setTimeout(function () { popGrad(thing, rad * (1 + (100 - rad) / 400)) }, 1)
        else console.log(rad, "break")
    }

}