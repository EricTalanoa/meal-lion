# Verification and acceptance

Package checks: tools/verify.cjs validates SHA-256 inventory, normalized asset references, grid indexes, roster counts, JSON parsing and local HTML links. Run node tools/verify.cjs after extraction. This is integrity validation, not browser gameplay testing.

Historical checks: original demo had desktop and 390px mobile review. Pilot logic received mocked-DOM checks; later galleries received static syntax/metadata checks. None establish that the approved layouts have been implemented or that native keyboards work on devices. Browser access was limited during later work.

Before claiming a playable release, verify:
- Correct, wrong, duplicate, empty, invalid and final guesses; aliases and no-match suggestions; explicit submission versus selection.
- Short (3) and long (9–10) ingredient sequences; no out-of-range clues; final guess win/loss; restart and replay semantics.
- Daily answer consistency, timezone rollover, reload restoration, version changes, offline behavior as supported; endless independence.
- Desktop split layout and phone portrait/landscape; actual iOS/Android keyboard; visible input/button, stable focus and viewport; no unwanted horizontal overflow.
- No answer art/name leaks in ordinary play, autocomplete or accessibility labels.
- Keyboard navigation and focus, screen-reader status text, readable contrast, touch target size, reduced motion and pause.
- Correct sprite cells, consistent placement, transparency, frame aspect ratios, unloaded-image fallbacks and restrained memory use.

Document exact tests and remaining limitations. Do not describe generated key poses as polished animations or the existing pilot as the production game.
