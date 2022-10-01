$.get('/user-obj', user => {
  if (user == 'nopers no elpers') window.location.href = "/welcome"

  $('#body #stats #welcome').html(`Lookin\' good, ${user.username}.`)
  $('#body #stats #bal').html(`Current Balance | $${user.balance}`)
  $('#body #stats #owned').html(`Cryptos Owned |  ${user.owner.length}`)
  $('#body #stats #minted').html(`Cryptos Minted | ${user.artist.length}`)
  $('#body #stats #joined').html(`Date Joined | ${new Date(user.created).toDateString()}`)
  $('#body #stats img').attr('src', `data:image/png;base64,${user.pfp}`)
})