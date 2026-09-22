# Quests and NPC contacts

The current NPC contact is Warden Ilyra, the Guild mentor. Friends lists NPCs, never places. Her one current quest is **Guild Combat Trial**: touch the entrance orb in the Training Room and complete targeting, facing, basic attacks, dodge, counter, charged Arts and Break. Completion grants Linear and moves the quest into a collapsible **Completed quests** archive. The Guild Hall is a location, not a quest or friend. The surrounding town is not implemented.

There is no duplicate Guild Trial quest chain in the current player-facing flow. Old completed-chain data is retained only to preserve previously earned skills in saves. Trial launching belongs to the physical orb, never the friends list. Ilyra has short local story chats about the hall and Skill Books; a physical NPC model and general relationship system remain future work.

Future quests should consume deterministic authored conditions through persistent counters and flags. Hidden quests stay invisible before activation, with requirements explained through environment and dialogue rather than hidden progress bars. Skill Books can become future tutorial-dungeon rewards; that dungeon and book ownership are not implemented yet.
