// Trusted Types API の最小限の型定義（TypeScript 標準の DOM 型には未収録）
interface TrustedScriptURL {
  toString(): string
}

interface TrustedTypePolicy {
  createScriptURL(input: string): TrustedScriptURL
}

interface TrustedTypePolicyFactory {
  createPolicy(name: string, rules: { createScriptURL?: (input: string) => string }): TrustedTypePolicy
}

interface Window {
  trustedTypes?: TrustedTypePolicyFactory
}
