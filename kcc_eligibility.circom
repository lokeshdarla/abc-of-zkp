pragma circom 2.1.8;

include "node_modules/circomlib/circuits/comparators.circom";

template KCCEligibility() {
    signal input age;          // private
    signal input landholding;  // private
    signal input income;       // private
    signal output finalElgible;    // public

    signal isAgeOk;
    signal isLandOk;
    signal isIncomeOk;

    // age >= 18
    component ageCheck = GreaterEqThan(32); // 32-bit comparator
    ageCheck.in[0] <== age;
    ageCheck.in[1] <== 18;
    isAgeOk <== ageCheck.out;

    // landholding >= 1
    component landCheck = GreaterEqThan(32);
    landCheck.in[0] <== landholding;
    landCheck.in[1] <== 1;
    isLandOk <== landCheck.out;

    // income <= 500000  →  500000 - income >= 0
    component incomeCheck = GreaterEqThan(32);
    incomeCheck.in[0] <== 500000;
    incomeCheck.in[1] <== income;
    isIncomeOk <== incomeCheck.out;

    signal eligible[3];
    eligible[0] <== isAgeOk;
    eligible[1] <== isLandOk;
    eligible[2] <== isIncomeOk;

    signal eligible2;
    eligible2 <== eligible[0] * eligible[1];

    finalElgible <== eligible2 * eligible[2];
}

component main = KCCEligibility();
