document.addEventListener('click', (e) => {
  if (e.target.dataset.short) {
    const url = `${
      window.location.origin || 'http://localhost:5000'
    }/redirect/${e.target.dataset.short}`

    navigator.clipboard
      .writeText(url)
      .then(() => console.log('text copied to clipboard'))
      .catch((error) => console.log(`Error: ${error}`))
  }
})
