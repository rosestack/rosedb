import { defineRoserepo, Runner } from "roserepo";

export default defineRoserepo({
  root: true,
  monorepo: {
    runner: {
      dev: Runner.many({
        parallel: true,
      }),
      build: Runner.pipeline({
        parallel: true,
        throwOnError: true,
        roserepoScript: [
          {
            pattern: "rosedb",
            match: "name",
          },
        ],
      }),
      test: Runner.many({
        parallel: false,
        throwOnError: true,
      }),
      lint: Runner.many({
        parallel: true,
        throwOnError: true,
      }),
    },
    upgrade: {
      excludeDependencies: [
        "chalk",
      ],
    },
  },
});