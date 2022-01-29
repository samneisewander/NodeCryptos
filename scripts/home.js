$.get('/user-obj', user => {
  if (user == 'nopers no elpers') {
    //render new user homepage
    console.log('No user!')
  }
  else{
    document.getElementById('nameplate-welcome').innerHTML = `Welcome back, ${user.username}!`
    document.getElementById('nameplate-balance').innerHTML = `¥${user.money}`
    document.getElementById('nameplate-cryptos').innerHTML = user.owner.length
  }
})

$.get('/cryptos', cryptos => {
  for (let crypto of cryptos){
    let tile = document.createElement('div')
    tile.classList = 'tile'

    let image = document.createElement('img')
    image.classList = 'tile-image'
    image.src = crypto.png
    tile.appendChild(image)

    let divider = document.createElement('div')
    divider.classList = 'tile-divider'
    tile.appendChild(divider)

    let nameLabel = document.createElement('div')
    nameLabel.classList = 'tile-label'
    nameLabel.innerHTML = 'NAME:'
    tile.appendChild(nameLabel)

    let name = document.createElement('div')
    name.classList = 'tile-field'
    name.innerHTML = crypto.name ? crypto.name : 'Untitled'
    tile.appendChild(name)

    let ownerLabel = document.createElement('div')
    ownerLabel.classList = 'tile-label'
    ownerLabel.innerHTML = 'OWNER:'
    tile.appendChild(ownerLabel)

    let owner = document.createElement('div')
    owner.classList = 'tile-field'
    owner.innerHTML = crypto.owner ? crypto.owner : 'None'
    tile.appendChild(owner)

    let artistLabel = document.createElement('div')
    artistLabel.classList = 'tile-label'
    artistLabel.innerHTML = 'ARTIST:'
    tile.appendChild(artistLabel)

    let artist = document.createElement('div')
    artist.classList = 'tile-field'
    artist.innerHTML = crypto.artist
    tile.appendChild(artist)

    let valueLabel = document.createElement('div')
    valueLabel.classList = 'tile-label'
    valueLabel.innerHTML = 'VALUE:'
    tile.appendChild(valueLabel)

    let value = document.createElement('div')
    value.classList = 'tile-field'
    value.innerHTML = '¥' + crypto.value
    tile.appendChild(value)

    document.getElementById('marketplace').appendChild(tile)
  }
})

let butt = document.getElementById('create-button')

butt.onclick = function(){
  window.location.href = "/create";
}
