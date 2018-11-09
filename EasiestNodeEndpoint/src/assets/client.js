window.onload = () => {

  // where we'll toss the output
  const tgt = document.getElementById('target');

  // how to go look it up
  const update = () =>
    fetch('http://127.0.0.1:15151/data')
      .then( response => response.json() )
      .then( jsonData => tgt.innerHTML = JSON.stringify(jsonData, undefined, 2) );

  // when presbutan, go look it up
  document.getElementById('againButton').onclick = update;

  // on load, look it up once
  update();

}
