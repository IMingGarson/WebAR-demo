self.addEventListener('message', function(e) {
    // let sum = Object.values(e.data).reduce(function(acc, val) {
    //     acc.x += val.x;
    //     acc.y += val.y;
    //     return acc;
    // }, { x: 0, y: 0 });
    // sum.x = sum.x / Object.values(e.data).length;
    // sum.y = sum.y / Object.values(e.data).length;
    console.log('worker data', e.data);
    if (e.data.preY * e.data.curY < 0) {
        if (e.data.curY < 0) {
            self.postMessage({ preY: e.data.preY, curY: e.data.curY * -1 });
        } else {
            self.postMessage({ preY: e.data.curY, curY: e.data.preY * -1 });
        }
    }
    self.postMessage({ preY: e.data.preY, curY: e.data.curY });
});
