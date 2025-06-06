module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: ["> 1%", "last 2 versions", "not dead"],
        },
        useBuiltIns: "entry",
        corejs: 3,
        modules: false,
      },
    ],
    [
      "@babel/preset-typescript",
      {
        allowNamespaces: true,
        allowDeclareFields: true,
      },
    ],
  ],
  plugins: [],
  env: {
    test: {
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              node: "current",
            },
            modules: "commonjs",
          },
        ],
        "@babel/preset-typescript",
      ],
    },
  },
};
