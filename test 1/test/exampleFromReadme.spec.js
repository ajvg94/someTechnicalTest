import { SocialNetworkQueries } from "../src/SocialNetworkQueries";

describe('SocialNetworkQueries', () => {
  describe("example from README", () => {

    it("should find potential likes", async () => {
      // given
      const user = {
        id: "mrouk3",
        likes: ["Moby Dick", "Crime and Punishment"],
        friends: [{
          id: "YazL",
          likes: ["Crime and Punishment", "Brave New World"],
        }, {
          id: "queen9",
          likes: ["Pride and Prejudice", "Crime and Punishment"],
        }, {
          id: "joyJoy",
          likes: ["Moby-Dick", "Pride and Prejudice"],
        }, {
          id: "0sin5k1",
          likes: ["Pride and Prejudice", "Brave New World"],
        }, {
          id: "mariP",
          likes: ["Moby-Dick", "Frankenstein", "Crime and Punishment"],
        }],
      };

      // when
      const potentialLikes = await new SocialNetworkQueries({
        fetchCurrentUser: () => Promise.resolve(user),
      }).findPotentialLikes(0.3);

      // then
      expect(potentialLikes).toEqual([
        "Pride and Prejudice",
        "Brave New World",
        "Moby-Dick",
      ]);
    });

  });
});
