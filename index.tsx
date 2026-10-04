import { 
    Plugin, 
    Props, 
    getModule 
} from "@vencord/plugin";
import { Discord } from "@discord/discord-js";

// Define the properties for each friend in our constellation
interface FriendNode {
    id: string;
    weight: number;      // How "heavy" they are (higher = closer to center)
    x: number;           // Current X position
    y: number;           // Current Y position
    z: number;           // Current Z position (Depth)
    baseX: number;       // The "home" X position after physics settle
    baseY: number;       // The "home" Y position
    baseZ: number;       // The "home" Z position
}

export default class SocialGravityLayout extends Plugin {
    // We use a Map because Discord IDs (Snowflakes) are unique keys.
    // This allows for O(1) lookup time when updating specific friends.
    public friendData: Map<string, FriendNode> = new Map();

    // The "Stage" or "Canvas" where all our friends will live.
    // We'll initialize this as a container in the Friends list area.
    private constellationContainer: HTMLElement | null = null;

    /**
     * Initialization: This runs when the plugin is first loaded.
     */
    async onMount() {
        this.initializeConstellation();
    }

    /**
     * Step 1: The Foundation
     * We grab every friend from Discord's internal state and create a unique 
     * FriendNode for each one with starting coordinates.
     */
    private initializeConstellation() {
        // Access the global Discord Presence to get all friends
        const friends = Discord.Presence.FRIENDS;

        friends.forEach((friend) => {
            // We give every friend a unique ID (the Snowflake)
            const id = friend.id;

            // Initializing with random coordinates ensures that when we 
            // apply physics later, the "gravity" has room to pull them into place.
            const newNode: FriendNode = {
                id: id,
                weight: 1.0, // We will refine this in Step 2
                x: Math.random() * 400 - 200, // Spread out initially
                y: Math.random() * 400 - 200,
                z: Math.random() * 200 - 100,
                baseX: Math.random() * 400 - 200,
                baseY: Math.random() * 400 - 200,
                baseZ: Math.random() * 200 - 100,
            };

            this.friendData.set(id, newNode);
        });

        // Note: In the next steps, we will create the DOM elements for these friends
        // and place them inside a single large "Constellation Stage."
    }

    /**
     * Helper method to get a specific friend's data easily.
     */
    public getFriend(id: string): FriendNode | undefined {
        return this.friendData.get(id);
    }
}
