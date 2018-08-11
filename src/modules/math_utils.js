'use strict';

// SHM - helper function - forces x to n decimal places and accounts for FP
// rounding issues
function dps(x, n) {
    // SHM - own def'n of epsilon, should really check to see if there is a
    // language constant and also that n < the number of dps in my constant
    var y = x + 0.0000000001; 
    y = Math.round(Math.pow(10, n) * x);
    return y / Math.pow(10, n);
};

export {dps};
