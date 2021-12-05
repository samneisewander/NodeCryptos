$.get('/cryptos', (data) => {
  let cryptos = JSON.parse(data)
  for (i in cryptos) {
    let j = Math.floor(Math.random() * cryptos.length)
    let item = cryptos[j]
    cryptos[j] = cryptos[i]
    cryptos[i] = item
  }
  for (let i = 0; i < cryptos.length; i++) {
    let newOne = document.createElement("canvas")
    let newCtx = newOne.getContext('2d')
    let newDiv = document.createElement("div")
    let newName = document.createElement("div")
    let newArtist = document.createElement("div")
    let newGrade = document.createElement("div")
    document.body.appendChild(newDiv)
    newDiv.appendChild(newOne)
    newOne.height = 24 * 10
    newOne.width = 24 * 10
    for (row in cryptos[i].dat) {
      for (col in cryptos[i].dat[row]) {
        newCtx.beginPath()
        newCtx.fillStyle = cryptos[i].dat[row][col] ? cryptos[i].dat[row][col] : "transparent"
        newCtx.fillRect(row * 10, col * 10, 10, 10)
      }
    }
    newDiv.appendChild(newName)
    newDiv.appendChild(newArtist)
    newDiv.appendChild(newGrade)
    newName.innerHTML = cryptos[i].name
    newArtist.innerHTML = cryptos[i].artist
    newGrade.innerHTML = "grade: " + cryptos[i].grade
    newDiv.style.display = "inline-block"
    newDiv.style.margin = "25px"
  }
})

