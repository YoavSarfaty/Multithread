const numberoftest = 20;
let table;

window.onload = async function () {
  table = [];
  //Generate table
  for (let i = 0; i < numberoftest; i++) {
    let row = document.createElement("TR");
    let numberofelementsText = document.createTextNode(numberWithCommas(numofelements(i)));
    let onethreadText = document.createTextNode("Waiting...");
    let multithreadText = document.createTextNode("Waiting...");
    table.push([numberofelementsText, onethreadText, multithreadText]);
    let a = document.createElement("TD");
    a.appendChild(numberofelementsText);
    row.appendChild(a);
    a = document.createElement("TD");
    a.appendChild(onethreadText);
    row.appendChild(a);
    a = document.createElement("TD");
    a.appendChild(multithreadText);
    row.appendChild(a);
    document.querySelector("#table").appendChild(row);
  }

  for (let i = 0; i < numberoftest; i++) {
    let a = await generateArray(numofelements(i));
    await new Promise((resolve, reject) => setTimeout(resolve, 1000)); //Wait a second before starting the test
    let starttime = window.performance.now();
    console.log(await multithread(mergesort, [merge, compare])(a.slice(), a.length + 1)); //Run on one background thread
    let endtime = window.performance.now();
    let singlethreadtime = endtime - starttime;
    table[i][1].data = `${singlethreadtime.toFixed(3)} milliseconds`;

    starttime = window.performance.now();
    console.log(await multithread(mergesort, [merge, compare])(a.slice(), a.length / 4)); //Run in multithread
    endtime = window.performance.now();
    let multithreadtime = endtime - starttime;

    let improvment = (1 - (multithreadtime / singlethreadtime)) * 100;

    table[i][2].parentElement.innerHTML = `${multithreadtime.toFixed(3)} milliseconds <b class="${(improvment>0)?"positive":"negative"}">(${improvment.toFixed(3)}%)</b>`;
  }
}

function numofelements(i) {
  return (1 + i) * 10000;
}

//for format
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// All arrays are generated on a different thread 'cause I can
const generateArray = multithread(async function (arraysize) {
  return new Array(arraysize).fill().map(() => (Math.random()));
});

async function mergesort(a, max = 1 << 12) {
  if (a.length > 1) {
    let middle = Math.floor(a.length / 2);
    let firsthalf, secondhalf;
    if (a.length < max) {
      //both run on same thread
      firsthalf = mergesort(a.splice(0, middle), max);
      secondhalf = mergesort(a, max);
    } else {
      //run on different thread
      firsthalf = multithread(mergesort, [merge, compare])(a.splice(0, middle), max);
      //this can run on the same thread
      secondhalf = mergesort(a, max);
    }
    [firsthalf, secondhalf] = await Promise.all([firsthalf, secondhalf]);
    a = merge(firsthalf, secondhalf);
  }
  return a;
}

function merge(a, b) {
  let r = [];
  let ai = 0;
  let bi = 0;
  while (a.length + b.length > ai + bi) {
    if (b.length == bi) {
      return r.concat(a.splice(ai));
    }
    if (a.length == ai) {
      return r.concat(b.splice(bi));
    }
    if (compare(b[bi], a[ai])) {
      r.push(a[ai]);
      ai++;
    } else {
      r.push(b[bi]);
      bi++;
    }
  }
}

function compare(a, b) {
  return (a > b);
}