module.exports = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",

  // 모듈 경로 매핑 (올바른 옵션명)
  moduleNameMapper: {
    "^@/(.*)": "<rootDir>/src/$1",
  },

  // 테스트 파일 패턴
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.(ts|js)",
    "<rootDir>/src/**/*.(test|spec).(ts|js)",
  ],

  // 커버리지 설정
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,js}",
    "!src/**/*.d.ts",
    "!src/index.ts",
    "!src/**/__tests__/**",
    "!src/**/*.test.ts",
    "!src/**/*.spec.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],

  // 설정 파일들
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],

  // 변환 설정
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },

  // 모듈 파일 확장자
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // 테스트 환경 설정
  testEnvironmentOptions: {
    url: "http://localhost",
  },

  // 전역 설정
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
      isolatedModules: true,
    },
  },

  // 캐시 디렉토리
  cacheDirectory: "<rootDir>/node_modules/.cache/jest",

  // 성능 최적화
  maxWorkers: "50%",

  // 에러 출력 설정
  verbose: true,
  errorOnDeprecated: true,
};
