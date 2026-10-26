## 1. Fix and tests

- [x] 1.1 Add a failing renderer test: a URL followed by `；` and text stops at the URL.
- [x] 1.2 Exclude CJK punctuation and fullwidth forms from the autolink character class.

## 2. Documentation and verification

- [x] 2.1 Note the URL boundary in `reference.md` and the contract test.
- [x] 2.2 Run `npm test` under Node 22, `openspec validate` for this change, and regenerate the acceptance views.
