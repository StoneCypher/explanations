window.onload = () => {

  const tgt = document.getElementById('target')

  const update = () =>
    fetch('http://127.0.0.1:15151/data')
      .then( response => response.json() )
      .then( jsonData => tgt.innerHTML = JSON.stringify(jsonData, undefined, 2) );

  document.getElementById('againButton').onclick = update;

  update();

}
