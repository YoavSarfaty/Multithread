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
    await mergesort(a.slice(), a.length + 1); //Run on one background thread
    let endtime = window.performance.now();
    let singlethreadtime = endtime - starttime;
    table[i][1].data = `${singlethreadtime.toFixed(3)} milliseconds`;

    starttime = window.performance.now();
    await mergesort(a.slice()); //Run in multithread
    endtime = window.performance.now();
    let multithreadtime = endtime - starttime;

    let improvment = (singlethreadtime - multithreadtime) * 100 / singlethreadtime;

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
      firsthalf = mergesort(a.slice(0, middle), max);
      secondhalf = mergesort(a.slice(middle), max);
    } else {
      //run on different thread
      firsthalf = multithread(mergesort, [merge, compare])(a.slice(0, middle), max);
      //this can run on the same thread
      secondhalf = mergesort(a.slice(middle), max);
    }
    [firsthalf, secondhalf] = await Promise.all([firsthalf, secondhalf]);
    a = merge(firsthalf, secondhalf);
  }
  return a;
}

function merge(a, b) {
  let r = [];
  while (a.length + b.length > 0) {
    if (b.length == 0) {
      return r.concat(a);
    }
    if (a.length == 0) {
      return r.concat(b);
    }
    if (compare(b[0], a[0])) {
      r.push(a.shift());
    } else {
      r.push(b.shift());
    }
  }
}

function compare(a, b) {
  return (a > b);
}