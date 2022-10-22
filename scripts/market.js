function generateAuction(current, next) {
    //need to docuemnt what these objs look like and also add socket integration

    let currentContainer = document.createElement('div')
    currentContainer.id = 'current'

    let art = document.createElement('img')
    art.id = 'art'
    art.src = current.png

    let infoContainer = document.createElement('div')
    infoContainer.id = 'info'
    currentContainer.appendChild(infoContainer)

    let infoWrapper = document.createElement('div')
    infoWrapper.id = 'wrapper'
    infoContainer.appendChild(infoWrapper)

    //all the stat shit that goes into the info wrapper
    let titleLabel = document.createElement('span')
    titleLabel.id = 'titleLabel'
    titleLabel.classList.add('label')
    titleLabel.innerHTML = 'Title:'
    infoWrapper.appendChild(titleLabel)

    let title = document.createElement('span')
    title.id = 'title'
    title.classList.add('value')
    title.innerHTML = current.name
    infoWrapper.appendChild(title)

    let artistLabel = document.createElement('span')
    artistLabel.id = 'artistLabel'
    artistLabel.classList.add('label')
    artistLabel.innerHTML = 'Artist:'
    infoWrapper.appendChild(artistLabel)

    let artist = document.createElement('span')
    artist.id = 'artist'
    artist.classList.add('value')
    artist.innerHTML = current.artist
    infoWrapper.appendChild(artist)

    let mintedLabel = document.createElement('span')
    mintedLabel.id = 'mintedLabel'
    mintedLabel.classList.add('label')
    mintedLabel.innerHTML = 'Date Minted:'
    infoWrapper.appendChild(mintedLabel)

    let minted = document.createElement('span')
    minted.id = 'minted'
    minted.classList.add('value')
    minted.innerHTML = current.date
    infoWrapper.appendChild(minted)

    let highestLabel = document.createElement('span')
    highestLabel.id = 'highestLabel'
    highestLabel.classList.add('label')
    highestLabel.innerHTML = 'Highest Bidder:'
    infoWrapper.appendChild(highestLabel)

    let highest = document.createElement('span')
    highest.id = 'highest'
    highest.classList.add('value')
    highest.innerHTML = 'buh buh buh'//uhhhhh what do i put here???
    infoWrapper.appendChild(highest)

    //end of stats section

    let value = document.createElement('div')
    value.id = 'value'
    value.innerHTML = current.value
    infoContainer.appendChild(value)

    let bid = document.createElement('div')
    bid.id = 'bid'
    bid.innerHTML = 'Bid!'
    bid.addEventListener('click', e => {
        //overlay code here
    })
    infoContainer.appendChild(bid)


    //adding these last so it doesnt appear weirdly
    currentContainer.appendChild(art)
    current.appendChild(infoContainer)
}