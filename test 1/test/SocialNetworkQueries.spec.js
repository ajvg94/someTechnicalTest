import { SocialNetworkQueries } from "../src/SocialNetworkQueries";

const anyError = () => Error("any error");

const resolved = (value) => Promise.resolve(value);

const rejected = (error) => Promise.reject(error);

const includeAllMinimalScore = () => 0;

const aLittleBitAbove = (minimalScore) => minimalScore + 0.01;

const aLittleBitBelow = (minimalScore) => minimalScore - 0.01;

const anyMinimalScore = 0.5;

describe("SocialNetworkQueries", () => {

    let friendsQueries;
    let fetchCurrentUser;

    beforeEach(() => {
        let mockedUserPromise;
        fetchCurrentUser = () => mockedUserPromise;
        fetchCurrentUser.willReturn = (userPromise) => {
            mockedUserPromise = userPromise;
        };
        friendsQueries = new SocialNetworkQueries({ fetchCurrentUser });
    });

    describe("potential book likes", () => {

        it("should find no potential likes if current user has no friends", async () => {
            // given
            const user = {
                likes: [],
                friends: [],
            };
            fetchCurrentUser.willReturn(resolved(user));

            // when
            const potentialLikes = await friendsQueries.findPotentialLikes(includeAllMinimalScore());

            // then
            expect(potentialLikes).toBeDefined();
            expect(potentialLikes.length).toEqual(0);
        });

        it("should find no potential likes if user's friends like no books", async () => {
            // given
            const user = {
                likes: [],
                friends: [{
                    id: "friend1",
                    likes: [],
                }],
            };
            fetchCurrentUser.willReturn(resolved(user));

            // when
            const potentialLikes = await friendsQueries.findPotentialLikes(includeAllMinimalScore());

            // then
            expect(potentialLikes).toBeDefined();
            expect(potentialLikes.length).toEqual(0);
        });

        it("potential likes should include books liked by friends", async () => {
            // given
            const user = {
                likes: [],
                friends: [{
                    id: "friend1",
                    likes: ["Gone with the Wind"],
                }, {
                    id: "friend2",
                    likes: ["One Hundred Years of Solitude"],
                }],
            };
            fetchCurrentUser.willReturn(resolved(user));

            // when
            const potentialLikes = await friendsQueries.findPotentialLikes(includeAllMinimalScore());

            // then
            expect(potentialLikes).toBeDefined();
            expect(potentialLikes.length).toEqual(2);
            expect(potentialLikes).toContain("Gone with the Wind");
            expect(potentialLikes).toContain("One Hundred Years of Solitude");
        });

        it("potential likes should include only books liked by given ratio of friends (score)", async () => {
            // given
            const user = {
                likes: [],
                friends: [{
                    id: "friend1",
                    likes: [
                        "A Tale of Two Cities"
                    ]
                }, {
                    id: "friend2",
                    likes: [
                        "A Tale of Two Cities",
                        "Harry Potter and the Prisoner of Azkaban"
                    ]
                }, {
                    id: "friend3",
                    likes: [
                        "A Tale of Two Cities",
                        "Harry Potter and the Prisoner of Azkaban",
                        "The Lord of the Rings"
                    ]
                }],
            };
            fetchCurrentUser.willReturn(resolved(user));

            // when
            const potentialLikes = await friendsQueries.findPotentialLikes(aLittleBitAbove(2 / 3));

            // then
            expect(potentialLikes).toBeDefined();
            expect(potentialLikes.length).toEqual(1);
            expect(potentialLikes).toContain("A Tale of Two Cities");
            expect(potentialLikes).not.toContain("Harry Potter and the Prisoner of Azkaban");
            expect(potentialLikes).not.toContain("The Lord of the Rings");
        });

        it("potential likes should not include books already liked by user", async () => {
            // given
            const user = {
                likes: ["Harry Potter and the Prisoner of Azkaban"],
                friends: [{
                    id: "friend1",
                    likes: ["A Tale of Two Cities"],
                }, {
                    id: "friend2",
                    likes: ["Harry Potter and the Prisoner of Azkaban"],
                }],
            };
            fetchCurrentUser.willReturn(resolved(user));

            // when
            const potentialLikes = await friendsQueries.findPotentialLikes(includeAllMinimalScore());

            // then
            expect(potentialLikes).toBeDefined();
            expect(potentialLikes.length).toEqual(1);
            expect(potentialLikes).toContain("A Tale of Two Cities");
            expect(potentialLikes).not.toContain("Harry Potter and the Prisoner of Azkaban");
        });

        it("potential likes should be ordered by popularity among friends (score)", async () => {
            // given
            const user = {
                likes: [],
                friends: [{
                    id: "friend1",
                    likes: [
                        "A-Like Title: Book Liked By 1 Friend",
                        "B-Like Title: Book Liked By 3 Friends",
                        "C-Like Title: Book Liked By 2 Friends",
                    ],
                }, {
                    id: "friend2",
                    likes: [
                        "B-Like Title: Book Liked By 3 Friends",
                        "C-Like Title: Book Liked By 2 Friends",
                    ],
                }, {
                    id: "friend3",
                    likes: [
                        "B-Like Title: Book Liked By 3 Friends",
                    ],
                }],
            };
            fetchCurrentUser.willReturn(resolved(user));

            // when
            const potentialLikes = await friendsQueries.findPotentialLikes(includeAllMinimalScore());

            // then
            expect(potentialLikes).toBeDefined();
            expect(potentialLikes).toEqual([
                "B-Like Title: Book Liked By 3 Friends",
                "C-Like Title: Book Liked By 2 Friends",
                "A-Like Title: Book Liked By 1 Friend",
            ]);
        });

        it("potential likes of same popularity (score) should be ordered by title", async () => {
            // given
            const user = {
                likes: [],
                friends: [{
                    id: "friend1",
                    likes: [
                        "The Lord of the Rings",
                        "Gone with the Wind",
                        "One Hundred Years of Solitude",
                    ],
                }, {
                    id: "friend2",
                    likes: [
                        "One Hundred Years of Solitude",
                        "Gone with the Wind",
                        "The Lord of the Rings",
                    ],
                }],
            };
            fetchCurrentUser.willReturn(resolved(user));

            // when
            const potentialLikes = await friendsQueries.findPotentialLikes(includeAllMinimalScore());

            // then
            expect(potentialLikes).toBeDefined();
            expect(potentialLikes).toEqual([
                "Gone with the Wind",
                "One Hundred Years of Solitude",
                "The Lord of the Rings",
            ]);
        });

    });

    describe("fetch failure", () => {

        it("should return no matches if user fetch failed", async () => {
            // given
            fetchCurrentUser.willReturn(rejected(anyError()));

            // when
            const potentialLikes = await friendsQueries.findPotentialLikes(anyMinimalScore);

            // then
            expect(potentialLikes).toEqual([]);
        });

        it("if possible should use previously fetched user if current user fetch failed (changed minimal score)", async () => {
            // given
            const user = {
                likes: [],
                friends: [{
                    id: "friend1",
                    likes: ["More Popular Book", "Less Popular Book"],
                }, {
                    id: "friend2",
                    likes: ["More Popular Book"],
                }, {
                    id: "friend3",
                    likes: [],
                }],
            };
            fetchCurrentUser.willReturn(resolved(user));
            await friendsQueries.findPotentialLikes(anyMinimalScore);

            // when
            fetchCurrentUser.willReturn(rejected(anyError()));
            const potentialLikes1 = await friendsQueries.findPotentialLikes(aLittleBitAbove(1 / 3));

            // then
            expect(potentialLikes1).toEqual(["More Popular Book"]);

            // and when
            fetchCurrentUser.willReturn(rejected(anyError()));
            const potentialLikes2 = await friendsQueries.findPotentialLikes(aLittleBitBelow(1 / 3));

            // then
            expect(potentialLikes2).toEqual(["More Popular Book", "Less Popular Book"]);
        });
    });

    describe("invalid data", () => {

        it("should find no potential likes if current user has no 'friends' field", async () => {
            // given
            const user = {
                likes: [],
                // no 'friends' field
            };
            fetchCurrentUser.willReturn(resolved(user));

            // when
            const potentialLikes = await friendsQueries.findPotentialLikes(includeAllMinimalScore());

            // then
            expect(potentialLikes).toEqual([]);
        });

        it("should not fail if some friend has no 'likes' field", async () => {
            // given
            const user = {
                likes: ["Book2"],
                friends: [{
                    id: "friendWithLikes",
                    likes: ["Book1"],
                }, {
                    id: "friendWithoutLikes",
                    // no 'likes' field
                }],
            };
            fetchCurrentUser.willReturn(resolved(user));

            // when
            const potentialLikes = await friendsQueries.findPotentialLikes(includeAllMinimalScore());

            // then
            expect(potentialLikes).toEqual(["Book1"]);
        });

        it("should filter out duplicated books of same friend", async () => {
            // given
            const user = {
                likes: [],
                friends: [{
                    id: "friend1",
                    likes: [
                        "BookScoredAboveMinimal",
                        "BookScoredBelowMinimal",
                        "BookScoredBelowMinimal",
                    ],
                }, {
                    id: "friend2",
                    likes: [
                        "BookScoredAboveMinimal",
                    ],
                }],
            };
            fetchCurrentUser.willReturn(resolved(user));

            // when
            const potentialLikes = await friendsQueries.findPotentialLikes(aLittleBitAbove(1 / 2));

            // then
            expect(potentialLikes).toEqual(["BookScoredAboveMinimal"]);
        });
    });

});