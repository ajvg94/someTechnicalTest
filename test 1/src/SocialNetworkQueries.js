export class SocialNetworkQueries {
    constructor({ fetchCurrentUser }) {
        this.fetchCurrentUser = fetchCurrentUser;
        this.lastKnownUserData = null;
    }

    async findPotentialLikes(minimalScore) {
        try {
        const userData = await this.fetchCurrentUser();

        // Cache the last known user data
        this.lastKnownUserData = userData;

        if (!userData || !userData.friends || !userData.friends.length) {
            //resolve with empty likes if User has no friends or something is missing
            return [];
        }

        const currentUserLikes = new Set(userData.likes || []);

        const potentialLikesMap = new Map();

        for (friend of userData.friends){
            if (friend.likes) {
                for (friendLike of friend.likes){
                    // Ignore books already liked by the current user
                    if (!currentUserLikes.has(friendLike)) {
                    // Count occurrences of each book liked by friends
                    potentialLikesMap.set(
                        friendLike,
                        (potentialLikesMap.get(friendLike) || 0) + 1
                    );
                    }
                };
            }
        };

        // Filter potential likes based on the minimal score
        const potentialLikes = Array.from(potentialLikesMap.entries())
            .filter(
            ([, count]) => count / userData.friends.length >= minimalScore
            )
            .sort((a, b) => {
            // Sort by count in descending order, then alphabetically
            if (b[1] !== a[1]) {
                return b[1] - a[1];
            } else {
                return a[0].localeCompare(b[0], 'en', { sensitivity: 'base' });
            }
            })
            .map(([title]) => title);
            return potentialLikes;
        } catch (error) {
        // If fetchCurrentUser rejects, use the last known user data
            if (this.lastKnownUserData) {
                return this.findPotentialLikes(minimalScore);
            } else {
                // If no successfully fetched user data exists, resolve with empty likes
                return [];
            }
        }
    }
}