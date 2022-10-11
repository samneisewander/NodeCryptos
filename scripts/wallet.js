$.get('/user-obj', result => {
    let batch = []
    if (result == 'nopers no elpers') return
    result.owner.forEach(item => {
        batch.push({ "type": 'crypto', "filter": { "_id": item }, "items": ['name', 'png', 'value', 'artist', 'trades', 'created'] })
    })
    $.ajax({
        url: '/batch-query',
        type: "POST",
        data: JSON.stringify({ "batch": batch }),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
    }).then(results => {
        results.forEach(result => createTile(result))
    })

    let balance = document.querySelector('#body #header #balance') 
    balance.innerHTML = result.balance
    count(balance)

})

function createTile(item) {
    let tile = document.createElement('div')
    let img = document.createElement('img')
    let name = document.createElement('span')
    let value = document.createElement('span')
    let icon = document.createElement('span')

    img.src = item.png
    tile.id = 'tile'
    name.id = 'name'
    name.innerHTML = item.name
    value.id = 'value'
    value.innerHTML = item.value
    value.classList.add('count')
    icon.classList.add('material-symbols-rounded')
    icon.innerHTML = 'expand_content'

    tile.appendChild(img)
    tile.appendChild(name)
    tile.appendChild(value)
    tile.appendChild(icon)

    tile.addEventListener('mouseenter', e => {
        value.innerHTML = item.value
        requestAnimationFrame(() => {
            img.style.transition = `filter .5s`
            img.style.filter = 'blur(5px)'
        })
        $(name).hide().fadeIn('swing')
        $(value).hide().fadeIn('swing')
        $(icon).hide().fadeIn('swing')
        count(value)
    })

    tile.addEventListener('mouseleave', e => {
        requestAnimationFrame(() => {
            img.style.transition = `filter .5s`
            img.style.filter = 'blur(0px)'
        })
        $(name).fadeOut('swing')
        $(value).fadeOut('swing')
        $(icon).fadeOut('swing')
    })

    tile.addEventListener('click', e => {
        showInspectOverlay(item)
    })

    $(name).hide()
    $(value).hide()
    $(icon).hide()
    document.body.querySelector('#body #tiles').appendChild(tile)
    $(tile).hide().fadeIn('swing')

}

function showInspectOverlay(crypto) {
    //stats and image rendering
    let overlay = document.querySelector('#overlay')
    let imgDiv = document.querySelector('#overlay #container img')
    let nameDiv = document.querySelector('#overlay #container #stats #name')
    let valueDiv = document.querySelector('#overlay #container #stats #value')
    let createdDiv = document.querySelector('#overlay #container #stats #created')
    let artistDiv = document.querySelector('#overlay #container #stats #artist')
    let tradesDiv = document.querySelector('#overlay #container #stats #trades')
    let closeDiv = document.querySelector('#overlay #container #close')

    imgDiv.src = crypto.png
    nameDiv.innerHTML = crypto.name
    valueDiv.innerHTML = crypto.value
    createdDiv.innerHTML = new Date(crypto.created).toDateString()
    artistDiv.innerHTML = crypto.artist
    tradesDiv.innerHTML = crypto.trades


    $("#overlay").css("display", "flex").hide().fadeIn()
    closeDiv.addEventListener('click', () => $("#overlay").fadeOut())
}

function count(obj) {
    let value = obj.innerHTML
    $({ counter: 0 }).animate({ counter: value }, {
        duration: 600,
        easing: 'swing',
        step: function () {
            obj.innerHTML = '$' + Math.ceil(this.counter)
        },
        complete: function () {
            obj.innerHTML = '$' + value
        }
    })
}  