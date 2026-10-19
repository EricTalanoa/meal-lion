# Design and interaction

Approved visual sources: reference/game-layouts/b-split-kitchen.png and mobile-keyboard-states.png. The selected-layout-and-mobile-behavior.md file is historical: its statement that mobile is unapproved is superseded by the user's “that looks good”.

Desktop: large animated kitchen on the left, revealed ingredient clues below it; guess entry, suggestions and guess history on the right. Keep the kitchen visible during guessing. Use cyan kitchen tones, navy interface, cyan/pink accents, and the existing lion in white toque/coat with red scarf. Extract actual colors from references if needed. Mockups guide placement; rebuild interface elements as accessible HTML. Courier New in prototypes is a placeholder, not a mandated font.

Mobile: full stage while browsing. On input focus and native keyboard opening, collapse the stage; retain clues and useful suggestions. Keep the guess input and submission control visible above the keyboard. After a valid submission dismiss the keyboard, restore the stage and play the reaction. Invalid/empty input should keep correction easy. Do not draw a fake keyboard. Account for visual viewport changes, safe-area insets, rotation, and iOS/Android behavior. Use at least 44px touch targets and 16px input text.

Seven to ten clue tiles must wrap or scroll without becoming tiny. Suggestions search the full allowed roster by typed text, never use hidden answer/clue filtering. A selected suggestion indicator is not a correctness checkmark. “Shakshuka with feta” in a mockup is illustrative, not a roster addition.

Respect reduced motion and provide pause/replay. Replay never consumes a clue or guess. Give ingredient reveals and results equivalent visible text, not animation alone. Keyboard access, visible focus and status announcements are required. Avoid moving the focused input during updates.

Other root concept images and layouts A/C are historical alternatives, not selected replacements.
