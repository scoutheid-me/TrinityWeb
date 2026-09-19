# Future quests and world facts

Quest gameplay is outside the Combat Lab milestone. There are no active quests, NPCs, trainers, relationships, or hidden quest UI in the prototype.

Future quest definitions should consume structured events and deterministic authored conditions through a persistent Event Ledger. Store bounded counters, flags, relationships, timestamps, and current quest state instead of every frame-level event. Existing combat counters provide an initial persistence boundary, not a full Event Ledger implementation.

Hidden quests remain mechanically invisible before activation: no journal entry, question-mark placeholder, achievement hint, objective, or progress display. Their authored requirements should become understandable through environmental storytelling and dialogue. Never let runtime generative AI decide eligibility. Build a developer-only condition inspector when implementing quests.

Normal quests may expose titles, objectives, and journal progress. Both normal and hidden quests should use the same event/condition infrastructure. Add quests after combat, enemy variety, equipment, and trainers are stable.
