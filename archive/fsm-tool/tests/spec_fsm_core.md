# Functional Black-box Tests (DFA)

## Even number of 0s (alphabet {0,1})
ACCEPT: "", "11", "00", "1010", "10110"
REJECT: "0", "10", "001", "101100"

## Ends with 'ab' (alphabet {a,b,c})
ACCEPT: "ab", "cab", "abab"
REJECT: "a", "b", "ba", "aba"

## Invalid JSON / model checks
- Missing 'start' → show error
- Duplicate (state, symbol) transition in DFA → blocked with alert
